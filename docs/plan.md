# Course Platform — Full Build Plan

Step-by-step plan for building v1, from the first setup command to launch day.

- **What** we're building: [SPEC.md](SPEC.md)
- **Visual overview**: [blueprint](https://claude.ai/artifact/3xVLB9zA86S8dPGHzLjaFv)
- **This file**: **how**, in **what order**, and **how we know each step works**.

Tick the boxes as we go. Don't start a phase until the previous phase's exit check passes.

---

## 0. Before we start

### Accounts you need
| Service | What to create | Used from |
|---|---|---|
| Neon | Project, Neon Auth turned on, Magic Link plugin turned on | Phase 0 |
| Polar | Sandbox organization and an access token. Production org later | Phase 0 |
| ImageKit | Account; turn on "restrict unsigned URLs" in a test folder | Phase 0 |
| Resend | Account and API key. Verified sending domain before launch | Phase 2 |
| Sentry | Next.js project (DSN and auth token) | Phase 1 |
| Vercel | Project linked to the Git repo, with the Neon integration | Phase 1 |
| GitHub | Repository for the code (CI runs here) | Phase 1 |

### Settings (environment variables)
Stored in `.env.local` locally and in Vercel for each environment. Never commit them.

| Variable | Secret? | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon Postgres connection (pooled) |
| `NEON_AUTH_BASE_URL` | no | Neon Auth endpoint |
| `NEON_AUTH_COOKIE_SECRET` | yes | Session cookie encryption (32+ characters) |
| `NEON_AUTH_WEBHOOK_PUBLIC_KEY` | no | Verify Neon Auth webhooks (Ed25519) |
| `RESEND_API_KEY` | yes | Send sign-in emails |
| `EMAIL_FROM` | no | e.g. `Your Name <hello@yourdomain.com>` |
| `POLAR_ACCESS_TOKEN` | yes | Polar API |
| `POLAR_WEBHOOK_SECRET` | yes | Verify Polar webhooks |
| `POLAR_SERVER` | no | `sandbox` or `production` |
| `POLAR_MONTHLY_PRODUCT_ID` | no | The $50/mo product |
| `POLAR_LIFETIME_PRODUCT_ID` | no | The $250 product |
| `IMAGEKIT_PRIVATE_KEY` | yes | Sign URLs and upload tokens |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | no | Browser uploads |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | no | e.g. `https://ik.imagekit.io/yourid` |
| `ADMIN_EMAIL` | no | The one admin account |
| `NEXT_PUBLIC_SITE_URL` | no | Absolute URLs (checkout return, sitemap, OG) |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | no | Error reporting |
| `SENTRY_AUTH_TOKEN` | yes | Source map upload (CI/Vercel only) |

### Rules for this codebase
- **Next.js 16.4 has breaking changes.** Read `node_modules/next/dist/docs/` before using any Next API.
  - `proxy.ts`, not `middleware.ts`.
  - Cache Components is on, so session reads go inside `<Suspense>`.
  - `'use cache'` + `cacheTag()` for cached reads.
  - `updateTag()` in Server Actions; `revalidateTag(tag, { expire: 0 })` in webhooks.
  - Never use the one-argument `revalidateTag`.
- **Security rules:**
  - Every permission check happens on the server, in `lib/auth/dal.ts` or `lib/access.ts`. `proxy.ts` only redirects for convenience.
  - Secrets are only read in files that start with `import 'server-only'`.
- **Code style:**
  - Business rules are pure functions with unit tests.
  - Database and API calls wrap them.
- **Package versions:**
  - Install the current stable versions with `npm install <pkg>`.
  - Check each package's docs at install time rather than relying on memory.

---

## Phase 0 — Quick tests on the risky parts
**Goal:** answer three unknowns before building on them. The code here is throwaway, in a `spikes/` folder that gets deleted afterwards.

### 0.1 ImageKit video protection
- [ ] Upload a ~2-minute test video to a private ImageKit folder with "restrict unsigned URLs" on.
- [ ] Note the upload size limit on your ImageKit plan.
- [ ] Write `spikes/imagekit-sign.ts`, which signs:
  - (a) a plain MP4 URL;
  - (b) an HLS URL: `…/video.mp4/ik-master.m3u8?tr=sr-360_720_1080`.
- [ ] Open (b) in a test page using hls.js. Check:
  - Does it play?
  - In the browser network tab, do the variant playlists and `.ts`/`.m4s` segments load?
  - Copy one segment URL into a private window. Is it **blocked**?
  - The first request may return **202** (processing). Note how long until it's ready.
- [ ] **Decision:**
  - If segments are protected → **HLS**.
  - If not → **signed MP4** (the fallback you already chose).
  - Write the decision into SPEC.md §7.

### 0.2 Neon Auth with Next 16 caching
- [ ] `npm install @neon/auth`. Create a throwaway sign-in page plus a page that reads `auth.getSession()` inside `<Suspense>`. Don't use `force-dynamic`, since Cache Components is on.
- [ ] Sign in with the Neon shared email (fine for a test), then run `npm run build`.
- [ ] **Decision:**
  - If the build passes and the session shows → keep Cache Components.
  - If not → turn it off and follow `docs/01-app/02-guides/caching-without-cache-components.md`.
  - Record the decision.

### 0.3 Polar sandbox events
- [ ] In the Polar sandbox, create:
  - "Test Course" ($25 one-time)
  - "Monthly" ($50/mo)
  - "Lifetime" ($250 one-time)
- [ ] Expose localhost with a tunnel (e.g. `ngrok http 3000`) and point a sandbox webhook at it. Use a tiny route that saves every payload to a file.
- [ ] Do each of these and save the JSON payload to `tests/fixtures/polar/`:
  - buy the course, then refund it fully;
  - buy the course, then refund it partially;
  - subscribe monthly, then cancel;
  - subscribe monthly, fail a renewal with a test card, and let it be revoked;
  - subscribe monthly, then buy lifetime.
- [ ] Revoke a subscription through the Polar SDK, confirm it works, and save that payload too.
- [ ] Confirm the `external_customer_id` passed at checkout shows up in the order and subscription payloads.

**Exit check:** three decisions written in SPEC.md, Polar fixtures saved, `spikes/` deleted.

---

## Phase 1 — Foundation
**Goal:** a clean, deployable skeleton with database, settings, errors and CI wired up.

### 1.1 Git and project hygiene
- [ ] `git init`, first commit of the scaffold, create the GitHub repo, push.
- [ ] Fill in `CLAUDE.md` (currently empty): point to `AGENTS.md`, `docs/SPEC.md` and `docs/plan.md`.
- [ ] `.env.example` lists every variable from section 0, with no values.

### 1.2 Packages
- [ ] UI: `npx shadcn@latest init`, then add `button card badge input textarea label form dialog alert-dialog sheet dropdown-menu table tabs progress skeleton sonner switch select separator avatar tooltip`.
- [ ] Data: `drizzle-orm @neondatabase/serverless` and dev dependency `drizzle-kit`.
- [ ] Validation and safety: `zod server-only`.
- [ ] Errors: `npx @sentry/wizard@latest -i nextjs`.
- [ ] Tests: dev dependencies `vitest @vitest/coverage-v8 @playwright/test`, then `npx playwright install chromium`.
- [ ] Theme: `next-themes`.

### 1.3 Settings check
- [ ] `lib/env.ts` (`server-only`): a zod schema for all server variables, parsed once, with a clear error naming any missing variable.
- [ ] `lib/env.public.ts`: the same, for `NEXT_PUBLIC_*` only.

### 1.4 Database
- [ ] `lib/db/index.ts`: a Drizzle client on the Neon serverless driver.
- [ ] `lib/db/schema.ts`: every table from SPEC §4.
  - Enums: `role`, `course_status`, `entitlement_kind`, `entitlement_status`.
  - Unique: `courses.slug`, `courses.polar_product_id`, `(lessons.course_id, lessons.slug)`, `entitlements.polar_order_id`, `entitlements.polar_subscription_id`, `profiles.polar_customer_id`.
  - Indexes: `entitlements(user_id)`, `lessons(section_id, position)`, `sections(course_id, position)`, `lesson_progress(user_id, updated_at desc)`.
  - Cascades: course → sections → lessons → attachments and progress.
- [ ] `drizzle.config.ts`. Add scripts `db:generate`, `db:migrate`, `db:studio` to `package.json`.
- [ ] Create a Neon `dev` branch, generate the first migration and apply it.
- [ ] `scripts/seed.ts`: one draft sample course with 2 sections and 4 lessons, for local work.

### 1.5 App shell
- [ ] Root `app/layout.tsx`: fonts, `ThemeProvider` (light/dark/system), `<Toaster />`.
- [ ] `components/site-header.tsx`:
  - Logo, Courses, Pricing.
  - The user menu, inside `<Suspense>`, shows Sign in or the avatar with Dashboard, Account, Admin (admin only) and Sign out.
- [ ] `components/site-footer.tsx`.
- [ ] Route groups `(marketing)`, `(auth)`, `(student)`, `admin`, each with placeholder pages and an `error.tsx` / `not-found.tsx`.
- [ ] Replace the default starter page with a placeholder landing page.

### 1.6 Deploy and CI
- [ ] Vercel project, with Neon's integration creating a database branch for each preview deploy.
- [ ] Set the env vars for Development, Preview and Production. Preview uses the Polar sandbox.
- [ ] `.github/workflows/ci.yml` runs on every PR: `npm ci`, `lint`, `tsc --noEmit`, `vitest run`.
- [ ] A Sentry test route throws once, and the error shows up in Sentry. Then remove the route.

**Exit check:** the skeleton runs locally and on a Vercel preview, migrations are applied, CI is green, and the test error reached Sentry.

---

## Phase 2 — Sign-in
**Goal:** magic-link login with branded emails, plus an admin role.

### 2.1 Neon Auth wiring
- [ ] Turn on Magic Link in the Neon Console with a 15-minute expiry and sign-ups allowed.
- [ ] `lib/auth/server.ts`: `createNeonAuth(...)`, exported as `auth`.
- [ ] `lib/auth/client.ts` (`'use client'`): `createAuthClient()`.
- [ ] `app/api/auth/[...path]/route.ts`: `export const { GET, POST, PUT, PATCH, DELETE } = auth.handler()`.
- [ ] `proxy.ts`: `auth.middleware({ loginUrl: '/login' })`, matching `/dashboard`, `/account`, `/admin`, `/checkout/success`.

### 2.2 Login page
- [ ] `app/(auth)/login/page.tsx`: an email form that calls `authClient.signIn.magicLink({ email, callbackURL: next ?? '/dashboard' })`.
- [ ] States: idle → sending → "Check your inbox at you@x.com", with a resend button (60-second cooldown) and a friendly error message.
- [ ] Keep the `?next=` parameter so students return to the page they were on.

### 2.3 Branded emails
- [ ] `npm install resend @react-email/components`.
- [ ] `emails/magic-link.tsx`: logo, one button, the link as plain text, "expires in 15 minutes", and "didn't ask for this? ignore it".
- [ ] `app/api/webhooks/neon-auth/route.ts`:
  1. Read the raw body and verify the Ed25519 signature; return 401 if it's bad.
  2. Handle `send.magic_link`: render the email and send it with Resend.
  3. Return 200 quickly. Neon gives the endpoint 15 seconds and makes 3 attempts.
  4. Report failures to Sentry.
- [ ] Subscribe the endpoint in the Neon Console (for local testing, use the tunnel).

### 2.4 Profiles and roles
- [ ] `lib/auth/dal.ts` (`server-only`):
  - `getUser()`: the session plus the profile, or null. Profiles are created by `ensureProfile`.
  - `ensureProfile(user)`: insert the profile if it's missing. `role = 'admin'` when the email equals `ADMIN_EMAIL`, otherwise `student`.
  - `requireUser(next?)`: redirect to `/login?next=…` when signed out.
  - `requireAdmin()`: `notFound()` for anyone else.
- [ ] Admin layout `app/admin/layout.tsx` calls `requireAdmin()`.
- [ ] Sign out from the user menu.

### 2.5 Tests
- [ ] Unit: the signature verifier accepts a valid sample and rejects a tampered one.
- [ ] Unit: `ensureProfile` assigns the admin role only for `ADMIN_EMAIL`.

**Exit check:** on a preview deploy, sign in with a real inbox using the branded email. The admin email reaches `/admin`, and a student email gets a 404 there.

---

## Phase 3 — Admin content tools
**Goal:** you can build a complete course in the browser.

### 3.1 ImageKit uploads
- [ ] `lib/imagekit.ts` (`server-only`): helpers to create upload tokens, sign URLs and delete files, using ImageKit's current Node/Next SDK (check its docs at install time).
- [ ] `app/api/imagekit/upload-auth/route.ts`: `requireAdmin()`, then return `{ token, expire, signature, publicKey }`.
- [ ] `components/admin/uploader.tsx`: picks a file, checks its type and size, uploads straight to ImageKit with a progress bar, and returns `{ fileId, filePath, size, mime }`.
- [ ] Folders:
  - `/courses/{courseId}/public/` for thumbnails and preview videos;
  - `/courses/{courseId}/private/` for lesson videos and attachments.
- [ ] Limits:
  - images: 10 MB, jpg/png/webp;
  - video: your plan's limit, mp4/mov/webm;
  - attachments: plan limit, pdf/zip/txt/md/pptx/key.

### 3.2 Courses
- [ ] `app/admin/page.tsx`: table of courses with title, status badge, lesson count, buyers count and last updated.
- [ ] `app/admin/courses/new` and `app/admin/courses/[id]`, a form validated with zod:
  - title, slug (generated from the title, editable, unique), subtitle;
  - `description_md` with a preview;
  - thumbnail and preview video upload;
  - `polar_product_id` (checked against the Polar API on save, showing the product name and price);
  - status.
- [ ] Server actions in `app/admin/courses/actions.ts`: `createCourse`, `updateCourse`, `setCourseStatus`, `deleteCourse`.
  - `deleteCourse` refuses when any entitlement points to the course, and the UI offers **Archive** instead.
  - Real deletes also remove ImageKit files (best effort, logged).
- [ ] After each change: `updateTag('catalog')` and `updateTag('course:' + id)`.

### 3.3 Curriculum (sections and lessons)
- [ ] `npm install @dnd-kit/core @dnd-kit/sortable`.
- [ ] `components/admin/curriculum-editor.tsx`:
  - Collapsible sections, lessons inside each.
  - Add, rename and delete (with a confirm dialog).
  - Drag to reorder sections, reorder lessons, and move lessons between sections.
  - Optimistic update, rolled back on error with a toast.
- [ ] Action `reorderCurriculum(courseId, tree)`: rewrites every `position` and `section_id` in one transaction and checks that every ID belongs to the course.

### 3.4 Lesson editor
- [ ] `app/admin/lessons/[id]/page.tsx`: title, slug, free-preview switch.
- [ ] Markdown editor: textarea on the left, preview on the right, stacked on mobile. `npm install react-markdown remark-gfm shiki` for highlighting.
- [ ] Video: upload or replace, then read and store the duration. Show the current video and a remove button.
- [ ] Attachments: upload several, rename the display name, reorder, delete.
- [ ] Unsaved-changes warning when leaving the page.

### 3.5 Tests
- [ ] Unit: the slug generator.
- [ ] Unit: the reorder function produces gap-free positions.
- [ ] Unit: the delete guard blocks courses with buyers.

**Exit check:** build a full course (2 sections, 4 lessons, a video, an attachment, a thumbnail). Reordering survives a refresh. Publish, unpublish and archive behave as expected.

---

## Phase 4 — Public site
**Goal:** visitors can browse, compare prices, and watch free previews.

### 4.1 Cached reads (`lib/queries/courses.ts`)
- [ ] `getPublishedCourses()`: `'use cache'`, `cacheTag('catalog')`.
- [ ] `getCourseBySlug(slug)`: `'use cache'`, `cacheTag('course:' + id)`, including sections and lessons (title, free-preview flag, duration only; never video IDs for paid lessons).
- [ ] `getPrices()` (`lib/polar.ts`): products from the Polar API, `'use cache'`, `cacheLife('hours')`, `cacheTag('prices')`.

### 4.2 Pages
- [ ] Landing `app/(marketing)/page.tsx`:
  - hero (your pitch);
  - course grid (cards with thumbnail, title, lesson count, total length);
  - pricing section with three cards (single course "from $X", Monthly $50, Lifetime $250).
  - The pricing buttons sit inside `<Suspense>` and depend on what the viewer owns (Phase 5).
- [ ] Course page `app/(marketing)/courses/[slug]/page.tsx`:
  - title, description (markdown), preview video (public URL), price;
  - curriculum list with 🔒 on locked lessons and "Preview" on free ones;
  - totals (lesson count, duration);
  - buy area inside `<Suspense>`.
- [ ] Lesson page shell `app/(marketing)/courses/[slug]/[lessonSlug]/page.tsx`: the free-preview version works now; the paid version comes in Phase 6.
- [ ] Archived courses: hidden from the grid; non-owners see "This course is no longer available".
- [ ] Empty state: "Courses coming soon" when nothing is published yet.

### 4.3 SEO
- [ ] `generateMetadata` for landing, course and preview pages: title, description, canonical URL, Open Graph and Twitter image (course thumbnail through an ImageKit transform at 1200×630).
- [ ] `app/sitemap.ts`: landing, published course pages, free preview lessons.
- [ ] `app/robots.ts`: disallow `/admin`, `/dashboard`, `/account`, `/checkout`, `/api`.
- [ ] `robots: { index: false }` metadata on the private route groups.

**Exit check:** a logged-out visitor can browse the catalog, see live prices, and open a free preview. Lighthouse SEO score ≥ 95 on the course page.

---

## Phase 5 — Payments and access
**Goal:** Polar purchases reliably turn into access, and nothing else does.

### 5.1 Entitlement rules (pure, fully tested)
- [ ] `lib/entitlements.ts`: `decide(event, current) → Action[]`, with no database or network calls.

| Event | Actions |
|---|---|
| `order.paid`, course product | `grantCourse(userId, courseId, orderId)` |
| `order.paid`, lifetime product | `grantLifetime(userId, orderId)`, plus `revokePolarSubscription(subId)` if the user has an active monthly plan |
| `order.paid`, monthly product (first or renewal) | no-op (subscription events handle it) |
| `order.refunded`, full | `revokeByOrder(orderId, 'refund')` |
| `order.refunded`, partial | no-op |
| `subscription.created/active/updated/uncanceled/past_due/canceled` | `upsertMonthly(userId, subId, status, periodEnd, modifiedAt)` |
| `subscription.revoked` | `upsertMonthly(... status: 'revoked')` |
| Any event older than the stored `modifiedAt` | no-op |
| Unknown product ID | `warn` (Sentry), no-op |

- [ ] `lib/entitlements.apply.ts`: runs the actions in one DB transaction. Polar API calls happen after the commit and are safe to repeat.

### 5.2 Webhook endpoint
- [ ] `npm install @polar-sh/nextjs @polar-sh/sdk`.
- [ ] `app/api/webhooks/polar/route.ts` uses `Webhooks({ webhookSecret, onPayload })`:
  1. Insert into `polar_webhook_events` by `webhook_id`; on conflict, return 200 (already handled).
  2. Find the user from `external_customer_id`, and save `polar_customer_id` on the profile.
  3. `decide` → `apply` → mark `processed_at`.
  4. `revalidateTag('user:' + userId, { expire: 0 })`.
  5. On error: report to Sentry, store the error on the row, and throw, so Polar retries.

### 5.3 Checkout
- [ ] `app/api/checkout/route.ts`:
  1. `requireUser()`.
  2. Work out the product from `?plan=course&courseId=…`, `?plan=monthly` or `?plan=lifetime`.
  3. Refuse if the student already has that access: return 409 with a friendly redirect back.
  4. Redirect to Polar Checkout with `products` and `external_customer_id`.
  5. The success URL is `/checkout/success?checkout_id={CHECKOUT_ID}`.
- [ ] Buy buttons are links to this route and disable themselves after one click.

### 5.4 Success page
- [ ] `app/(student)/checkout/success/page.tsx`: a client component polls `/api/me/access` every 2 seconds, for up to 60 seconds.
  - States: "Finalizing your purchase…" → "You're in!", with a button to the course or dashboard.
  - On timeout: "Payment received. Access usually appears within a minute, refresh soon", plus a support email.
- [ ] `app/api/me/access/route.ts` returns the current user's entitlements (no-store).

### 5.5 Buy-button logic
- [ ] `lib/purchase-state.ts`: `getPurchaseState(entitlements, courseId?)` returns one of `anon | none | ownsCourse | monthly | lifetime`, plus the list of buttons from SPEC §2.
- [ ] `components/buy-area.tsx` renders from that state. Used on the landing pricing, course page and lesson paywall.

### 5.6 Billing portal
- [ ] `app/api/portal/route.ts`: `CustomerPortal({ getExternalCustomerId: user.id })`.
- [ ] `app/(student)/account/page.tsx`: email, current access summary, "Manage billing" (only shown when the student has bought anything), sign out.

### 5.7 Tests (using the Phase 0 fixtures)
- [ ] `decide()`: every row in the 5.1 table, plus duplicate delivery, out-of-order delivery, and monthly→lifetime.
- [ ] `getPurchaseState()`: every row in SPEC §2's button table.
- [ ] Webhook route: a bad signature → 403; the same `webhook_id` twice → processed once.

**Exit check:** on a preview deploy with the Polar sandbox, buy a course, then monthly, then lifetime. The monthly plan is revoked automatically, a full refund removes access, and the buttons are correct at every step.

---

## Phase 6 — Lesson player
**Goal:** paid lessons play only for people with access.

### 6.1 Access check
- [ ] `lib/access.ts`:
  - `canWatch({ user, lesson, course, entitlements, now })`, a pure function following SPEC §2;
  - `loadAccessContext(userId, courseId)`, which loads the data for it.
- [ ] Draft course → admin only. Archived course → existing owners and all-access only.

### 6.2 Signed media
- [ ] `lib/imagekit.ts`:
  - `signedVideoUrl(filePath, ttlSeconds = 3600)`, HLS or MP4 depending on the Phase 0 decision;
  - `signedFileUrl(filePath, ttl = 300)`.
- [ ] `app/api/video-url/route.ts`: `?lessonId`, then `canWatch`, then `{ url, expiresAt }`. Cached as `no-store`.
- [ ] `app/api/attachments/[id]/route.ts`: `canWatch` on the parent lesson, then a 302 redirect to the signed file URL.

### 6.3 Lesson page
- [ ] Layout: player at the top, title, markdown content, attachments list, prev/next buttons. Curriculum sidebar on desktop; a sheet opened by a "Contents" button on mobile.
- [ ] `components/player/video-player.tsx`:
  - `<video>`, plus `hls.js` if HLS was chosen.
  - On a 403 or expiry: fetch `/api/video-url`, swap the source, and seek back to the current time.
  - Keyboard: space, ←/→ 5 seconds, f for fullscreen.
- [ ] No access → paywall card using `buy-area`, with the curriculum still visible.
- [ ] Signed out on a paid lesson → paywall with "Sign in", carrying `?next=` back to the lesson.

### 6.4 Tests
- [ ] `canWatch`: every rule, plus drafts, archived courses, canceled-but-still-paid, past_due, revoked.
- [ ] e2e: a signed-out user requesting `/api/video-url` and `/api/attachments/x` gets 401/403.

**Exit check:**
- A paid video plays for an owner.
- The same lesson shows the paywall for a non-owner.
- An old signed URL stops working after it expires.
- Free previews play signed out.

---

## Phase 7 — Progress and dashboard
**Goal:** students pick up where they left off and see how far they've got.

### 7.1 Saving progress
- [ ] `app/api/progress/route.ts` (POST, `{ lessonId, position, duration }`):
  1. `requireUser`, then `canWatch`.
  2. Upsert `last_position_seconds`, and `max_position_seconds = greatest(old, new)`.
  3. Set `completed_at` when `max ≥ 0.9 × duration` and it isn't already set.
  4. Throttle per user to one write every 5 seconds per lesson.
- [ ] The player sends progress every 15 seconds while playing, on pause, and on `visibilitychange`/`pagehide` (`navigator.sendBeacon`).
- [ ] Resume: start at `last_position_seconds`, or 0 if the lesson is complete or within 10 seconds of the end. Show a small "Resumed at 4:32 · Start over" note.

### 7.2 Completion
- [ ] "Mark complete" / "Mark incomplete" button (server action, optimistic UI). Text-only lessons rely on it.
- [ ] Sidebar ticks and a course progress bar update after completion via `updateTag('progress:' + userId)`.

### 7.3 Dashboard
- [ ] `lib/queries/progress.ts`:
  - `getCourseProgress(userId)`: per course, completed lessons ÷ total lessons;
  - `getContinueWatching(userId)`: latest updated incomplete lesson per course.
- [ ] `app/(student)/dashboard/page.tsx`:
  - "Continue watching" row: thumbnail, lesson title, time left, a Resume button.
  - "My courses" grid with progress bars. All-access students see every published course; course buyers see what they bought.
  - Empty state: "You don't have any courses yet", with a Browse courses button.
  - Archived courses the student owns still appear, with an "Archived" badge.

### 7.4 Tests
- [ ] Unit: the completion threshold and resume-position rules.
- [ ] e2e: watch part of a lesson, reload, and it resumes. Finish it, and the tick and percentage update.

**Exit check:** close the tab mid-video and come back to the same spot. The dashboard shows correct progress.

---

## Phase 8 — Admin users view
- [ ] `app/admin/users/page.tsx`: paginated table with email, joined date, access summary (Lifetime / Monthly (status, renews or ends on date) / N courses), last active, and search by email.
- [ ] `app/admin/users/[id]/page.tsx`: every entitlement with its status, dates, and the Polar order or subscription ID (linked to the Polar dashboard); progress per course. Read-only.
- [ ] Admin dashboard counts: students, active monthly, lifetime, course buyers. Revenue stays in Polar.

**Exit check:** the details for each test buyer match what Polar shows.

---

## Phase 9 — Hardening and launch

### 9.1 Polish
- [ ] Loading skeletons for the dashboard, course page, lesson page and admin tables.
- [ ] Error pages: friendly text, a "Try again" button, and the error reported to Sentry.
- [ ] Empty states reviewed on every list.
- [ ] Mobile check at 375px on every page; tablet at 768px.
- [ ] Dark mode check on every page.

### 9.2 Security pass
- [ ] Every server action and API route calls `requireUser` / `requireAdmin` / `canWatch` itself.
- [ ] `grep` the client bundle for secret names; there should be none.
- [ ] Rate limits on `/api/checkout`, `/api/progress` and `/api/video-url`.
- [ ] Course page and lesson props never include video paths for lessons the viewer can't watch.
- [ ] Security headers in `next.config.ts` (CSP allowing ImageKit, Polar and Sentry; `frame-ancestors 'none'`).

### 9.3 Accessibility
- [ ] Keyboard-only run through sign-in, buying, watching and admin drag-and-drop (dnd-kit keyboard sensor).
- [ ] Labels on every input, visible focus rings, contrast checked in both themes.

### 9.4 End-to-end tests (Playwright, against a preview deploy)
- [ ] Sign-in, using a test-only bypass that **is never enabled in production**, or the Resend test inbox.
- [ ] Buy a course in the Polar sandbox → access appears → watch → progress saved.
- [ ] Non-owner sees the paywall; admin can create and publish a lesson.

### 9.5 Launch checklist
- [ ] Polar production: create the real products, paste the course product IDs in admin, set the monthly/lifetime IDs in Vercel production env, set the production webhook URL and secret.
- [ ] Real $25 purchase, then refund it. Access appears and then disappears.
- [ ] Resend: domain verified (SPF, DKIM), `EMAIL_FROM` uses it.
- [ ] Neon Auth: production domain added to trusted origins; magic-link webhook pointing at production.
- [ ] ImageKit: "restrict unsigned URLs" on for production folders.
- [ ] Sentry: production DSN, alert rule for webhook errors and new issues.
- [ ] Sitemap submitted to Google Search Console.
- [ ] Database backup / point-in-time restore confirmed in Neon.

**v1 done when:**
- every v1 flow works on production with real payments;
- paid media can't be reached without a valid signature;
- all tests are green;
- Sentry is receiving errors.

---

## Testing summary
| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest | `decide()`, `canWatch()`, `getPurchaseState()`, progress rules, slugs, reorder, signature checks |
| Integration | Vitest + Neon test branch | webhook route end to end with fixtures, `apply()` transactions |
| End to end | Playwright | sign in, buy, watch, resume, admin publish |
| Manual | Checklists above | mobile, dark mode, keyboard, launch steps |

## Decision log
| Date | Decision |
|---|---|
| 2026-11-01 | Spec approved (see SPEC.md) |
| — | Phase 0.1 video approach: _pending_ |
| — | Phase 0.2 Cache Components: _pending_ |
| — | Phase 0.3 Polar payload notes: _pending_ |

## Built later (the design already allows for these)
- Polar benefits for Discord and GitHub.
- Discounts and bundles. A bundle maps one product to several courses; the product→course lookup is one function, so it's easy to extend.
- Lesson Q&A, certificates (uses `completed_at`), transcripts and captions (new `lesson_transcripts` table; pgvector for the AI tutor).
- Welcome and announcement emails (Resend is already set up).
- Waitlist courses (`coming_soon` status plus a `waitlist` table).
- Completion and drop-off analytics (from `lesson_progress`).

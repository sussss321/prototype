# Implementation Plan — Course Platform v1

Source of truth for *what*: [SPEC.md](SPEC.md). This file is the *how* and *in what order*.
Each phase ends in something you can click through. Don't start a phase until the previous exit check passes.

## Verified API notes (checked 2026-11-01)
- **Next.js 16.4.3** (bundled docs in `node_modules/next/dist/docs/`):
  - `middleware` is renamed **`proxy.ts`** (`export function proxy` / default export).
  - **Cache Components** (`cacheComponents: true`): `'use cache'` + `cacheTag()` + `cacheLife()`. Session reads must sit inside `<Suspense>`.
  - Server Actions invalidate with **`updateTag(tag)`**. Webhooks/route handlers use **`revalidateTag(tag, { expire: 0 })`**. The one-argument `revalidateTag` is deprecated.
- **Neon Auth** (`@neon/auth`, now called "Managed Better Auth"):
  - Server side is `createNeonAuth` from `@neon/auth/next/server`, the route is `app/api/auth/[...path]/route.ts` → `auth.handler()`, and `proxy.ts` uses `auth.middleware({ loginUrl })`. The client is `createAuthClient` from `@neon/auth/next`.
  - Sign-in is `authClient.signIn.magicLink({ email, callbackURL })`. Magic link must be enabled in the Neon Console. The `send.magic_link` webhook is signed with Ed25519.
  - Env vars: `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`.
  - ⚠ Neon's guide uses `export const dynamic = 'force-dynamic'`, which may conflict with Cache Components. Phase 0 tests this.
- **Polar** (`@polar-sh/nextjs`):
  - `Checkout()` takes the `?products=…&external_customer_id=…` query parameters.
  - `CustomerPortal({ getExternalCustomerId })`.
  - `Webhooks({ webhookSecret, onOrderPaid, onOrderRefunded, onSubscriptionCreated/Updated/Active/Canceled/Uncanceled/PastDue/Revoked, … })` verifies signatures and returns non-2xx on a throw, so Polar retries.
  - `environment: "sandbox"` for dev and previews.
  - Env vars: `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`.

## Target structure
```
app/
  (marketing)/page.tsx, courses/[slug]/page.tsx, courses/[slug]/[lessonSlug]/page.tsx
  (auth)/login/page.tsx
  (student)/dashboard/, account/, checkout/success/
  admin/ (layout guards role) courses/, courses/[id]/, lessons/[id]/, users/, users/[id]/
  api/auth/[...path]/  api/checkout/  api/portal/  api/webhooks/polar/  api/webhooks/neon-auth/
  api/imagekit/upload-auth/  api/video-url/  api/attachments/[id]/  api/progress/
  sitemap.ts  robots.ts
lib/
  env.ts            # zod-validated env, server-only
  db/ schema.ts, index.ts (Drizzle + Neon serverless driver)
  auth/ server.ts, client.ts, dal.ts (getUser, requireUser, requireAdmin, ensureProfile)
  access.ts         # canWatch() — pure + DB loader
  purchase-state.ts # which buy buttons to show
  entitlements.ts   # Polar event → entitlement transitions (pure core + DB apply)
  polar.ts  imagekit.ts  resend.ts
  queries/ courses.ts, progress.ts (cached reads tagged per course)
components/ ui/ (shadcn), player/, curriculum/, admin/
proxy.ts            # redirect-only convenience; real checks live in the data layer (dal)
drizzle/            # migrations
tests/unit, tests/e2e
```

---

## Phase 0 — Spikes to remove risk (throwaway code, ~1–2 days)
1. **ImageKit HLS + signing.** Upload a test video to a private folder and turn on "restrict unsigned URLs". Request a signed `…/ik-master.m3u8?tr=sr-360_720_1080`. Check whether the variant playlists and segments load, and whether they're blocked when unsigned. Also record the upload size limit on your plan.
   → **Decision:** HLS (hls.js) or the signed MP4 fallback.
2. **Neon Auth + Cache Components.** Build a minimal page with `cacheComponents: true`. Read `auth.getSession()` inside `<Suspense>`, without `force-dynamic`, and confirm the build passes.
   → **Decision:** keep Cache Components, or fall back to the "caching without Cache Components" guide.
3. **Polar sandbox.** Create the 3 product types (a test course, monthly, lifetime) and run a checkout with `external_customer_id`. Capture real payloads for `order.paid`, `order.refunded` (full and partial), and `subscription.canceled`, `subscription.past_due` and `subscription.revoked`. Test revoking a subscription through the SDK.
   → Save the payloads as test fixtures in `tests/fixtures/polar/`.

**Exit:** all 3 decisions written into SPEC.md, fixtures committed.

## Phase 1 — Foundation
- Install shadcn (init + base components), Drizzle + `@neondatabase/serverless` + drizzle-kit, zod, `server-only`, and the Sentry Next.js SDK (via its wizard). Set up Vitest and Playwright.
- `lib/env.ts` validates every env var at boot (separate server and public schemas).
- `lib/db/schema.ts` holds every table from SPEC §4: enums, unique constraints, cascades, and indexes on `entitlements(user_id)`, `lessons(course_id)` and `lesson_progress(user_id, updated_at)`. Generate and apply the first migration to a Neon dev branch.
- App shell: root layout, header (logo, Courses, Pricing, Sign in / avatar menu), footer, theme toggle (light/dark/system), toaster.
- Vercel project, with Neon's Vercel integration (one DB branch per preview) and env vars for each environment.
- GitHub Actions: lint, typecheck, unit tests on every PR.

**Exit:** the empty shell deploys to a Vercel preview with its own Neon branch, and a Sentry test error shows up.

## Phase 2 — Auth
- `lib/auth/server.ts`, `client.ts`, the catch-all route, and `proxy.ts` protecting `/dashboard`, `/account`, `/admin`, `/checkout/success`.
- `/login`: email field → `signIn.magicLink` → a "check your inbox" state with a resend cooldown.
- `/api/webhooks/neon-auth`: verify the Ed25519 signature, then send a branded email through Resend (with a React Email template). Return 2xx fast; Neon gives the endpoint 15 seconds.
- `lib/auth/dal.ts`:
  - `getUser()` and `requireUser()` (redirect to `/login?next=`), and `requireAdmin()` (404 for non-admins).
  - `ensureProfile()` creates the profile on first sign-in and sets `role=admin` when the email matches `ADMIN_EMAIL`.
- Turn off sign-up restrictions (anyone can sign up) and set the magic-link expiry (e.g. 15 minutes).

**Exit:** sign in on a preview deploy with a real inbox. The admin email lands on `/admin`, and a student email gets a 404 on `/admin`.

## Phase 3 — Admin content management
- **Courses list:** status badges, create, edit, archive, delete. Deleting is blocked when entitlements exist; the UI offers Archive instead.
- **Course form (zod-validated):**
  - Slug is generated from the title and can be edited; it must be unique.
  - Description is markdown with a preview.
  - Thumbnail and preview video are uploaded.
  - `polar_product_id` is checked against the Polar API on save, and the product name is shown.
  - Status: draft, published or archived.
- **Curriculum editor:** sections and lessons in one tree, drag-and-drop with `@dnd-kit` (reorder within a section, move between sections). Each drop saves through one transactional server action, with an optimistic UI.
- **Lesson editor:**
  - Title, slug and free-preview toggle.
  - Markdown textarea with a live preview (`react-markdown` + `remark-gfm` + Shiki highlighting).
  - Video upload with progress bar. Store `fileId`, path and duration.
  - Attachments: upload, rename, reorder, delete.
- **Uploads:** `/api/imagekit/upload-auth` (admin only) returns a short-lived upload token. The browser uploads directly to ImageKit:
  - paid lesson videos and attachments → private folder;
  - thumbnails and preview videos → public folder.
  - Enforce size and type limits on the client and in the token request.
- Every mutation calls `updateTag('course:<id>')` and `updateTag('catalog')`.

**Exit:** create a full course (2 sections, 4 lessons, video and attachments) end to end; reordering survives a refresh; publish and unpublish work.

## Phase 4 — Public catalog & SEO
- **Landing:** hero, published course grid (cached, tagged `catalog`), and a 3-tier pricing section.
- **Prices** come from the Polar API, cached with `cacheLife('hours')` and tagged `prices`.
- **Course sales page:**
  - Description, preview video (public), price, and the full curriculum. Locked lessons show 🔒; free previews show a "Preview" badge and link.
  - The buy area streams in behind `<Suspense>` and reads `getPurchaseState(user, course)` (Phase 5).
- **Metadata:** `generateMetadata` per page, with OG images from the course thumbnail.
- **Indexing:** `sitemap.ts` covers published courses and free previews; `robots.ts` blocks the private areas; `noindex` on admin, dashboard, account and checkout.
- Archived courses: no catalog listing, no sitemap entry, and the sales page tells non-owners "no longer available".

**Exit:** a logged-out visitor can browse, see prices, and open a free preview lesson page (the player comes in Phase 6).

## Phase 5 — Payments & entitlements (core business logic)
- **`lib/entitlements.ts`:** a pure function `applyPolarEvent(currentState, event) → actions` plus a DB layer that applies those actions in one transaction. It covers:
  - `order.paid`: product → a course entitlement or a lifetime entitlement. On lifetime with an active monthly subscription, queue `revokeSubscription`.
  - `order.refunded`: full refund → revoke that order's entitlement; partial refund → no change (ASSUMPTION).
  - `subscription.*`: upsert by `polar_subscription_id`, storing status and `current_period_end`. Ignore events older than the stored `modified_at` (guards against out-of-order delivery).
  - Unknown product → log a warning to Sentry and return 200 (so Polar doesn't retry forever).
- **`/api/webhooks/polar`:**
  1. Insert into `polar_webhook_events` by `webhook_id`; if the ID already exists, return 200.
  2. Apply the event, then call Polar to revoke the subscription when needed (idempotent).
  3. Run `revalidateTag('user:<id>', { expire: 0 })`.
  4. Map the user from `external_customer_id`, and store `polar_customer_id` on the profile.
- **`/api/checkout`:** `requireUser`, refuse when already entitled (no double-buying), then redirect to Polar Checkout with `products` and `external_customer_id`. Disable the button while pending.
- **`/checkout/success`:** a client component polls `/api/me/entitlements` every 2 seconds for up to about 60 seconds. When access appears → "You're in!" with a link to the course. On timeout → "Payment received, access is still syncing", with support contact.
- **`/api/portal`:** `CustomerPortal({ getExternalCustomerId })`. `/account` links to it.
- **`lib/purchase-state.ts`:** maps (user, entitlements, course) → the button table in SPEC §2.
- **Unit tests (Vitest, using the Phase 0 fixtures):** every transition — grant, duplicate delivery, refund (full/partial), cancel → access until period end, past_due keeps access, revoke removes it, lifetime-while-monthly → revoke queued, events out of order.

**Exit:** with Polar sandbox on a preview deploy, buy a course, then monthly, then lifetime; the subscription is revoked automatically; a refund removes access; the buttons are correct at every step.

## Phase 6 — Lesson player & protected media
- **`lib/access.ts`:** `canWatch` as in SPEC §2, with unit tests for every rule, including draft-is-admin-only and archived-but-owned.
- **Lesson page:**
  - With access → player + markdown + attachments.
  - Without access → paywall card with the purchase options, curriculum still visible.
  - Curriculum sidebar shows completion ticks and becomes a sheet/drawer on mobile.
  - Prev/next navigation across sections.
- **Video:**
  - The server signs the URL after `canWatch` (TTL about 1 hour). The player (hls.js or `<video>`, depending on the Phase 0 decision) calls `/api/video-url?lessonId=` on expiry or error and seeks back to the last position.
  - Free previews use a public URL.
- **`/api/attachments/[id]`:** checks access, then 302-redirects to a short-lived signed ImageKit URL.

**Exit:** the paid video URL stops working once it expires; a logged-out or unentitled user can't get at video or attachment bytes by any route; free previews play logged out.

## Phase 7 — Progress & dashboard
- **`/api/progress` (POST, throttled per user):** `{lessonId, position, duration}` → upsert `last_position_seconds` and `max_position_seconds`. It sets `completed_at` once `max_position >= 0.9 * duration`. It checks `canWatch` first.
- **Player saves:** every 15 seconds, on pause, and on `visibilitychange`/`pagehide` via `sendBeacon`. It resumes from `last_position_seconds`, and starts from 0 if the lesson was finished.
- **"Mark complete" / "Mark incomplete"** button: a server action with an optimistic UI.
- **Course % helper:** `completed / total lessons in published sections`.
- **`/dashboard`:**
  - "Continue watching": the most recently updated incomplete lesson per course.
  - "My courses": the courses the student owns, or all courses for all-access holders, each with a progress bar.
  - An empty state with a CTA to browse courses.

**Exit:** watch half a lesson, close the tab, and come back to the same position; finish it and the tick and % update.

## Phase 8 — Admin users view
- `/admin/users` is a paginated, searchable table: email, joined date, access summary (Lifetime, Monthly (status), N courses).
- `/admin/users/[id]` shows the user's entitlements with their Polar order/subscription IDs (linked to the Polar dashboard) and per-course progress. Read-only.

## Phase 9 — Hardening & launch
- Sentry: user ID tag, webhook failures captured with the event type, source maps uploaded, alerts on webhook errors.
- Error and empty states everywhere: `error.tsx` and `not-found.tsx` per route group, plus skeleton `loading` UI.
- Security pass: every server action and route checks auth itself (don't rely on `proxy.ts`), no secrets in client bundles, rate limits on `/api/progress` and `/api/checkout`.
- Playwright e2e on a preview deploy: magic link (via the Resend test inbox, or a dev-only bypass that is disabled in prod) → buy a course in the Polar sandbox → watch → progress saved.
- Accessibility basics: keyboard-operable player and drag-and-drop, labels, contrast in both themes.
- **Launch checklist:**
  - Polar production products created and their IDs pasted.
  - Production webhook secret set, and a test purchase refunded.
  - Resend domain verified (SPF/DKIM).
  - Neon Auth production domain and trusted origins set.
  - ImageKit "restrict unsigned" turned on in production.
  - Sentry production DSN configured.
  - Sitemap submitted to Search Console.

**v1 done** = SPEC §12 "done" definition.

---

## Designed now so later features don't need a rewrite
- **Polar benefits (Discord, GitHub):** configured in Polar only; no app change needed.
- **Discounts and bundles:** Polar-native. A bundle can grant several course entitlements if we map product → many courses later. Keep the product → course lookup in one function.
- **Q&A, certificates, transcripts, AI tutor:**
  - `lessons` has a stable ID for new tables to point at.
  - `lesson_progress.completed_at` provides the data certificates need.
  - Transcripts can go into a new `lesson_transcripts` table, with pgvector on Neon later.
- **Waitlist:** add a `coming_soon` course status plus a `waitlist` table.
- **Analytics:** `lesson_progress` already holds the data for completion rates and drop-off.
- **Emails:** Resend is already wired up for auth.

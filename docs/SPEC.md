# Course Platform — v1 Spec (interview complete)

## Context
A solo content creator wants their own course platform: they are the only admin/instructor, and students sign up, buy access, and watch courses. This spec captures every decision made in the interview so the implementation plan has no major guesswork. Approving it = "turn this into a phased implementation plan."

Existing code: `prototype/` is a fresh Next.js **16.4.3** / React 19.3 / Tailwind 4 / TS scaffold (only default `app/`). `prototype/AGENTS.md` says Next 16 has breaking changes → read `node_modules/next/dist/docs/` before writing code (caching, proxy/middleware, params, etc.).

---

## 1. Product & scope
**Users:** 1 admin (owner) · students · anonymous visitors.

**Pricing (all in Polar):**
| Plan | Price | Grants |
|---|---|---|
| Single course | ~$25 one-time (per course, set in Polar) | That course, forever |
| Monthly | $50/mo | All courses while active |
| Lifetime | $250 one-time | All courses incl. future |

**v1 in scope:** landing (courses + 3-tier pricing), course sales page, lesson player, progress tracking + resume, student dashboard, Polar checkout + customer portal, protected video, admin CRUD + uploads + reorder + draft/published/archived, read-only users view.

**Later, design must not block:** Polar benefits (Discord/GitHub), discounts & bundles (Polar-native), lesson Q&A, certificates, transcripts/captions + search, AI tutor (transcript-based), welcome/announcement emails, waitlist courses, admin analytics (completion rate, drop-off).

**Out of scope:** gamification, forum, mobile app, live streaming, multi-instructor, i18n, custom billing/invoice UI, custom receipts (Polar sends them).

## 2. Access rules (core business logic — one server-only function)
`canWatch(user, lesson)` is true if **any**:
1. Lesson `is_free_preview` (no login needed) and course is published/archived.
2. Active **lifetime** entitlement.
3. **Monthly** entitlement with status `active`, `past_due` (Polar retrying), or `canceled` with `current_period_end > now`.
4. Active **course** entitlement for that lesson's course.
Admin can watch everything (incl. drafts). Draft courses are invisible to non-admins.

**Entitlement lifecycle (Polar webhooks = only source of truth):**
- `order.paid` → grant course or lifetime (product ID → course via `courses.polar_product_id`; monthly/lifetime product IDs from env).
- `order.refunded` (full) → revoke that order's entitlement.
- `subscription.*` (created/active/updated/canceled/uncanceled/revoked) → upsert the monthly entitlement (status, period end).
- Cancel → keep access until `current_period_end`.
- Failed renewal → keep access while `past_due`; revoke when Polar revokes.
- **Lifetime granted while monthly active** → call Polar API to revoke the subscription immediately, no refund (idempotent).
- Checkout success page grants nothing; it shows "Finalizing your purchase…" and polls our DB until the entitlement appears (timeout → friendly message + support contact).

**Buy-button states:**
| Viewer | Course page shows |
|---|---|
| Anonymous | "Sign in to buy" / pricing |
| Logged in, no access | Buy this course + "or get all-access" (monthly/lifetime) |
| Owns course | "Continue learning" (+ upsell all-access) |
| Monthly | "Continue learning" + "Upgrade to lifetime" — no per-course buy |
| Lifetime | "Continue learning" only — nothing to buy |

## 3. Pages & routing
- **Public:** `/` (hero, course grid, pricing), `/courses/[slug]` (sales page: description, preview video, price from Polar, full curriculum with locked lessons marked 🔒), `/courses/[slug]/[lessonSlug]` (renders for free previews; locked → paywall), `/login`, `/checkout/success`.
- **Student (auth):** `/dashboard` (my courses, continue watching, progress bars), lesson player (same lesson route when entitled), `/account` (email, "Manage billing" → Polar customer portal).
- **Admin (role=admin):** `/admin` (courses list), `/admin/courses/new`, `/admin/courses/[id]` (details, sections/lessons tree w/ drag-drop), `/admin/lessons/[id]` (markdown editor + preview, video, attachments, free-preview toggle), `/admin/users`, `/admin/users/[id]` (what they own).
- **API routes:** `/api/webhooks/polar`, `/api/webhooks/neon-auth` (send magic link via Resend), `/api/checkout`, `/api/portal`, `/api/imagekit/upload-auth` (admin only), `/api/progress`, `/api/video-url` (re-sign on expiry).
- Protection enforced server-side on every page/route/action (proxy for redirects is convenience only, never the check).

## 4. Data model (Drizzle, Neon Postgres)
Users live in Neon Auth's managed schema; we reference by user ID.
- **profiles**: `user_id` PK, `role` (student|admin), `polar_customer_id` unique null, timestamps. Admin set by seed matching `ADMIN_EMAIL`.
- **courses**: id, `slug` unique, title, subtitle, `description_md`, thumbnail (ImageKit path/fileId), `preview_video` (path/fileId), `polar_product_id` unique, `status` (draft|published|archived), position, `published_at`, timestamps.
- **sections**: id, `course_id` FK cascade, title, position.
- **lessons**: id, `section_id` FK, `course_id` (denormalized for access checks), `slug` unique per course, title, `content_md`, video path/fileId, `duration_seconds`, `is_free_preview`, position, timestamps.
- **lesson_attachments**: id, `lesson_id` FK cascade, ImageKit path/fileId, filename, size, mime, position.
- **entitlements**: id, `user_id`, `kind` (course|monthly|lifetime), `course_id` null, `polar_order_id` unique null, `polar_subscription_id` unique null, `status`, `current_period_end` null, `granted_at`, `revoked_at`, `revoke_reason`.
- **polar_webhook_events**: `webhook_id` PK (idempotency), type, payload jsonb, received_at, processed_at, error.
- **lesson_progress**: (`user_id`, `lesson_id`) PK, `last_position_seconds`, `max_position_seconds`, `completed_at` null, `updated_at`. Course % = completed / lessons in course. (Also the raw data future drop-off analytics needs.)

**Deletion:** course with any entitlement → cannot hard-delete, only archive (hidden from catalog; owners + all-access keep watching). Course without buyers → hard delete (cascade sections/lessons/attachments/progress; ImageKit files deleted best-effort). Lessons/sections can be deleted (with confirm); progress rows cascade. Reorder = transactional position rewrite.

## 5. Architecture
- **Server Components** fetch data via Drizzle; **Server Actions** for admin mutations + mark-complete; **route handlers** for webhooks, checkout/portal redirects, progress beacons, signing.
- Business logic in server-only modules: `access.ts`, `entitlements.ts` (webhook → entitlement), `polar.ts`, `imagekit.ts`.
- **Caching:** public catalog/sales pages cached and revalidated on admin publish/edit (use Next 16's current cache APIs — verify in bundled docs). User-specific parts (buy buttons, progress) rendered dynamically.
- **State:** server state via RSC + revalidation; tiny client state (player, editor); URL state for lesson route. No real-time; checkout success polls. Optimistic UI only for mark-complete + drag-drop reorder.

## 6. Integrations — who owns what
| Service | Owns |
|---|---|
| **Neon** | Postgres (all app data), Neon Auth (Managed Better Auth) sessions + users; DB branches per preview deploy |
| **Neon Auth** | Magic-link sign-in only; `send.magic_link` webhook → our endpoint (Ed25519 verified) |
| **Resend** | Sends magic-link emails (branded); later welcome/announcements |
| **Polar** | Products/prices, checkout, receipts, customer portal, tax (merchant of record), webhooks; later benefits/discounts/bundles. Checkout created server-side with our user ID as external customer ID |
| **ImageKit** | Video, images, attachments. Admin uploads browser → ImageKit direct (server signs upload token). Paid videos + attachments private/restricted-unsigned; thumbnails public |
| **Sentry** | Client + server errors, webhook failures, tagged with user ID |
| **Vercel** | Hosting, preview deploys per PR |

## 7. Video delivery
- Server checks `canWatch`, then returns a short-lived signed URL (TTL ~1h; player fetches a fresh URL from `/api/video-url` on expiry/resume). Private key server-only.
- **Step 1 (spike):** test ImageKit HLS (`ik-master.m3u8`) with signed URLs + "restrict unsigned" → confirm segments/variants are protected. Handle 202 "processing" on first manifest request.
- **If it works:** adaptive HLS (hls.js / ImageKit player with signer). **If not:** signed MP4 (decided fallback).
- Free preview videos: public URL fine.

## 8. Progress
Player saves position every ~15s, on pause, and on page hide (`sendBeacon`). Resume from `last_position_seconds`. Auto-complete at ~90% watched; manual "Mark complete" button too (text-only lessons). Dashboard "continue watching" = most recently updated incomplete lesson per course.

## 9. UI
shadcn/ui, mobile-first responsive; lesson sidebar → drawer on mobile; prev/next nav; markdown rendered with code highlighting; skeleton loading states; empty states (no courses yet, no purchases yet, no lessons in section); confirm dialogs for destructive admin actions; toasts for errors.

## 10. SEO
Index: landing, course pages, free-preview lessons. Per-page metadata + Open Graph image (course thumbnail), `sitemap.xml`, `robots.txt`. `noindex`: dashboard, admin, account, checkout. Modern evergreen browsers only.

## 11. Security & edge cases
- All keys (Polar, ImageKit private, Resend, Neon Auth webhook secret, Sentry auth) server-only.
- Every admin action re-checks role on server. Every lesson/attachment/video request re-checks access.
- Webhooks: verify signature, store by `webhook_id` (idempotent), process in transaction, safe against out-of-order events (upsert by order/subscription ID; compare timestamps).
- Duplicate checkout clicks → disable button; repeat course purchase blocked in UI (already owned).
- Expired session mid-lesson → redirect to login, return to lesson. Polar/ImageKit outage → clear error states, Sentry alert.

## 12. Environments, testing, done
- Local (Neon dev branch, Polar sandbox, ImageKit dev folder) → Vercel preview (per-PR Neon branch, Polar sandbox) → production. Env vars per environment.
- Tests: Vitest unit tests on `canWatch` + every webhook → entitlement transition (incl. upgrade, refund, cancel, past_due); Playwright e2e for sign-in → buy (Polar sandbox) → watch → progress.
- **v1 done =** all v1 flows work on production with real Polar payment, paid videos unreachable without a valid signature, tests green, Sentry receiving errors.

---

## ASSUMPTIONS (not firmly stated by you)
- No AI in v1; AI model provider chosen in v2.
- Garbled rules read as: success page grants nothing; cancel = access to period end; refund = revoke; monthly→lifetime = cancel sub.
- Only **full** refunds revoke; partial refunds keep access. Chargebacks/disputes treated as refund.
- Monthly product + lifetime product IDs come from env vars (not per-course).
- Single admin = `ADMIN_EMAIL` env, seeded `role=admin`.
- Signed URL TTL ~1h with refresh; attachments downloaded via signed URL after access check.
- Light + dark mode, following system preference with a toggle.
- No product analytics tool in v1 beyond Vercel Analytics; Polar dashboard covers revenue.
- No separate long-lived staging; previews + Polar sandbox suffice.
- Rate limiting relies on Neon Auth for sign-in; progress endpoint throttled per user.

## OPEN RISKS
1. **ImageKit HLS signing** — docs don't confirm segments are signed → spike first; fallback signed MP4.
2. **ImageKit limits** — free plan ~100MB/video upload, raw files ~20–40MB; your videos are mostly <10 min so may fit, but verify current plan limits (likely want a paid tier at launch).
3. **Signed URLs ≠ DRM** — screen recording / sharing a link within its TTL remains possible.
4. **Next.js 16.4 API drift** — caching/proxy/params conventions differ from older versions; must follow bundled docs.
5. **Neon Auth maturity** — managed product evolving; verify magic-link webhook, preview-branch behavior, and how to read the session in Server Components.
6. **Webhook ordering & delays** — out-of-order Polar events and slow delivery; mitigated by idempotent upserts and success-page polling.
7. **Polar API specifics** — confirm external customer ID field, subscription revoke endpoint, and refund event payloads against current Polar docs.

## Next step
Turn this into a phased implementation plan (foundation → auth → content/admin → video spike + player → Polar + entitlements → progress/dashboard → SEO/polish → tests/launch), verifying current docs for Next 16.4, Neon Auth, Polar, ImageKit, and shadcn before each phase.

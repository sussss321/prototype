# Design System — "Sky & Glass"

The visual language for every page on the platform: marketing, course pages, lesson player, dashboard and admin.

- **Reference image:** `design/Screenshot 2026-11-01 at 5.05.53 PM.png`
- **Live reference:** run `npm run dev` and open **http://localhost:3000/design-system**. It renders every token and component.
- **Rule:** new pages are built from the pieces below. If a page needs something new, add it here and on `/design-system` first, then use it.

---

## 1. Where things live

| What | File |
|---|---|
| Color, glass, radius, shadow tokens and type utilities | `app/globals.css` |
| Fonts | `app/layout.tsx` (Manrope, Cormorant Garamond, Geist Mono) |
| Brand name, hero image, nav, prices, placeholders | `lib/site.ts` |
| shadcn primitives (restyled) | `components/ui/*` |
| Design-system building blocks | `components/brand/*` |
| Site chrome (header, footer) | `components/site/*` |
| Course pieces (card, cover, player preview) | `components/course/*` |
| Pricing card | `components/pricing/pricing-card.tsx` |
| Light/dark mode | `components/theme-provider.tsx`, `components/theme-toggle.tsx` |
| Sample data (until the DB exists) | `lib/sample-data.ts` |

## 2. Principles

1. **The sky is the canvas.** Pages sit on a slate-steel blue (`#AFC5DA`). Hero areas sit on the `bg-sky` frame, which is pale `#C9DBE3` for the top 40% and darkens to steel `#7894A6` at the bottom, with large rounded corners. **Text on the sky is white**, as in the reference. Text on light glass and white cards is slate ink.
2. **Glass for everything that floats.** Cards, nav and chips are frosted glass (`glass`). One element per group may be lifted to near-white (`glass-strong`) to draw the eye.
3. **Light, large type.** Headlines use weight 300 with tight tracking. Numbers are thin and oversized. Weight is used for emphasis only in small text.
4. **One blue accent.** The royal-blue gradient (`#3171F6 → #3E8BD8`) is reserved for the single main action in a view, progress, and "done" states. Everything else is slate, white or glass.
5. **Pills and soft corners.** Controls are fully rounded; panels use 24–40px radii. There are no sharp corners anywhere.
6. **Calm motion.** Hover lifts by 2–4px, chips nudge toward their arrow, and there's nothing else. Respect `prefers-reduced-motion` (already handled globally).

## 3. Tokens

All colors are CSS variables in `app/globals.css`, with light (`:root`) and dark (`.dark`) values. **Never hard-code hex values in components.**

### Palette sampled from the reference
| Role | Hex | Token / class |
|---|---|---|
| Page around the frame | `#AFC5DA` | `--background` · `bg-background` |
| Sky frame, top (flat) | `#C9DBE3` | `--sky-top` · `bg-sky-top` |
| Sky haze (soft light band) | `#D9E6EB` | `--sky-haze` |
| Sky frame, middle | `#A5BBC7` | `--sky-mid` |
| Sky frame, bottom | `#7894A6` | `--sky-bottom` |
| Text on sky | `#FFFFFF` / 86% white | `text-on-sky` / `text-on-sky-muted` |
| Wordmark | white at 38% (≈ `#DDE9ED`) | `--wordmark` |
| Slate ink (text on light surfaces) | `#2F3D40` | `text-foreground` |
| Muted slate | `#43535A` | `text-muted-foreground` |
| White pill text | `#48595B` | `text-secondary-foreground` |
| Action blue (button gradient) | `#3171F6 → #3E8BD8` | `bg-brand-gradient`, `--primary` |
| Pale-blue badge | `#C4DBF3` on `#54738D` | `bg-tag text-tag-foreground` (`Badge variant="soft"`) |
| Lifted white card | `#FFFFFF → #E4F0F7` | `glass-strong` |

**Text color rule:** on `bg-sky` or `glass` that sits on the sky → `text-on-sky` (add `text-on-sky-shadow` to small text). On the page canvas, `glass` panels or `glass-strong` → `text-foreground`. For bands where white text has to sit near the top, use `bg-sky-deep` (`GlassPanel tone="skyDeep"`).

### Other semantic colors
| Token | Class | Use |
|---|---|---|
| `--secondary` | `bg-secondary` | White pill surfaces |
| `--muted` | `bg-muted` | Progress tracks, disabled fills |
| `--border` / `--input` | `border-border` | Form controls, dividers on solid surfaces |
| `--success` / `--warning` / `--destructive` | `text-success`… | Status only: completed, past due, refunded |

### Brand scale
`brand-50` … `brand-950`, built around the action blue `#3171F6` (= `brand-600`). Use for icon tints and charts. Badges use the `tag` colors instead.

### Surfaces (custom utilities)
| Utility | Looks like | Use |
|---|---|---|
| `glass` | translucent white, blur, hairline white edge | Default card, nav capsule, chips |
| `glass-strong` | near-white, lifted shadow | The one highlighted card per group, active nav item, dropdowns |
| `bg-sky` | pale top → steel-blue bottom, soft haze band | Hero frames, feature bands, video backdrop |
| `bg-sky-deep` | steel-blue mid → bottom only | Call-to-action bands with white text |
| `bg-brand-gradient` | light → deep blue diagonal | Primary button, progress fill, "done" ticks |

Also available as Tailwind colors: `bg-glass`, `bg-glass-strong`, `border-glass-border`; and shadows: `shadow-glass`, `shadow-float`, `shadow-brand`.

> Glass only reads well on top of the sky. Don't put `glass` on a plain white area. Use `glass-strong` or a solid `bg-secondary` there.

### Radius
`--radius: 1rem`. Use `rounded-2xl` for small cards and inner media, `rounded-3xl` for cards, `rounded-4xl` for pricing and large panels, and `rounded-[2.5rem]` for hero frames (or `GlassPanel radius="frame"`). Controls use `rounded-full`.

## 4. Typography

| Role | Class | Font / weight | Where |
|---|---|---|---|
| Wordmark | `type-wordmark` (via `<Wordmark>`) | Cormorant Garamond 300, uppercase | Behind hero content only |
| Display | `type-display` | Manrope 300, −3.5% tracking | One per page: the H1 |
| Title | `type-title` | Manrope 300 | Section H2s |
| Subtitle | `type-subtitle` | Manrope 500 | Card titles, H3 |
| Body | `text-base leading-relaxed` | Manrope 400 | Paragraphs (max ~65ch) |
| Small | `text-sm` / `text-xs` + `text-muted-foreground` | Manrope 400 | Captions, meta |
| Eyebrow | `type-eyebrow` | Manrope 600, uppercase, +14% tracking | Section labels, table headers |
| Stat | `type-stat` (via `<Stat>`) | Manrope 200, tabular numbers | Big numbers: prices, %, counts |
| Serif accent | `type-serif-accent` | Cormorant italic | One word or symbol ("&") inside a display headline |
| Code | `font-mono` | Geist Mono | Code, timestamps, IDs |

Use `tabular-nums` wherever numbers line up: durations, prices, progress.

## 5. Layout

- **Page container:** `mx-auto w-full max-w-7xl px-4 md:px-6`.
- **Section rhythm:** `gap-24 md:gap-32` between sections, and `gap-10` between a section header and its content.
- **Hero frame:** the page is wrapped in `p-2.5 sm:p-4 md:p-5`. The frame is `bg-sky rounded-[1.75rem] md:rounded-[2.5rem]`, with header inside → wordmark → visual → content anchored at the bottom.
- **Grids:**
  - cards: `sm:grid-cols-2 lg:grid-cols-3`;
  - features: `sm:grid-cols-2 lg:grid-cols-4`;
  - sidebar layouts: `lg:grid-cols-[1.6fr_1fr]` (player) or `lg:grid-cols-[16rem_1fr]` (dashboard and admin).
- **Mobile first:** every layout must work at 375px with no sideways scrolling. Hero visuals shrink and move above the text on phones.

## 6. Components

### Buttons (`components/ui/button.tsx`)
| Variant | Size | Use |
|---|---|---|
| `brand` | `pill` / `pill-sm` / `pill-lg` | The single main action in a view ("Browse courses", "Buy", "Continue") |
| `pill` | same | Secondary action (white pill) |
| `glass` | same, or `icon-pill` | Tertiary actions, toolbars, icon buttons |
| `ghost`, `outline`, `destructive`, `link` | shadcn defaults | Admin tables, inline actions, dangerous actions |

Add `<ButtonOrb>` as the last child for the round arrow circle:
```tsx
<Link href="/#courses" className={buttonVariants({ variant: "brand", size: "pill" })}>
  Browse courses
  <ButtonOrb><ChevronRight /></ButtonOrb>
</Link>
```
Links that look like buttons use `buttonVariants()` on `<Link>`. The shadcn `Button` is Base UI–based and has no `asChild`.

### Badges (`components/ui/badge.tsx`)
- `soft`: the reference's pale-blue chip, and the default label (levels, "Free previews", "Best value", "Preview", section eyebrows).
- `glass`: white text on clear glass, only over the darker lower part of the sky.
- `success`: "Completed".
- `outline`: "Draft".
- `destructive`: "Refunded".

### Brand building blocks (`components/brand/*`)
| Component | Purpose | Notes |
|---|---|---|
| `GlassPanel` | Every card/panel | `tone`: glass / strong / sky; `radius`: md / lg / xl / frame; `padding`: none / sm / md / lg |
| `Wordmark` | Giant serif brand name behind content | Decorative (`aria-hidden`). Parent must be `relative overflow-hidden`. Once per frame |
| `HeroVisual` | Hero centerpiece | Uses `siteConfig.heroImage` if set, else the orb composition |
| `Orb` | Glossy blue sphere | Size with `w-*`. Max two per view; `glow={false}` for small ones |
| `ArrowChip` | Round ↗ in a card corner | `href` + `label` makes it a link; without, it's decorative inside a linked card |
| `AvatarStack` | Overlapping avatars + count pill | Social proof. Only with real numbers in production |
| `Stat` | Thin big number + unit + caption | Keep the unit short (%, h, +) |
| `SectionHeader` | Eyebrow + title + description (+ action) | `align="center"` for pricing-style sections |
| `PillNav` | Glass capsule navigation | Active item gets `glass-strong` |
| `Logo` / `LogoMark` | Brand mark + name | Mark inherits `currentColor` |

### Product components
- `CourseCard`: the whole card links to the course; cover, level badge, ↗ chip, title, 2-line subtitle, lessons, duration and price.
- `CourseCover`: the real thumbnail, or a generated sky cover tinted by `coverHue`.
- `PricingCard`: `featured` on exactly one tier (strong glass + brand button, lifted on desktop).
- `LessonPlayerPreview`: the target look for the real lesson player (Phase 6). Shows the video on a sky backdrop, glass play button, gradient progress bar, and a curriculum with done / current / preview / locked states.

## 7. Recipes for upcoming pages

| Page | Build it like this |
|---|---|
| **Course sales page** `/courses/[slug]` | Sky hero frame: course title in `type-display`, `Wordmark` with a short course word, cover or preview video as `HeroVisual`, buy area as a `glass-strong` card on the right. Below: curriculum in a `GlassPanel` using the `LessonPlayerPreview` row styles (🔒 for locked, `soft` "Preview" badge) |
| **Lesson player** | Exactly `LessonPlayerPreview`'s layout, made real: video in `glass-strong`, curriculum sidebar in `glass` (sheet on mobile), markdown below the video in a `glass` panel, prev/next as `pill` buttons, "Mark complete" as `brand` |
| **Paywall** | `glass-strong` card over the blurred video area: lock icon chip, one sentence, `brand` button for the best option, `pill` for the alternatives |
| **Student dashboard** | `SiteHeader` on the sky page. "Continue watching" row of `glass-strong` cards (cover + `Stat`-style % + `brand` "Resume"), then a "My courses" grid of `CourseCard`s with a gradient progress bar |
| **Login** | Small centered sky frame with `Wordmark`, a `glass-strong` form card, email input, `brand` "Email me a sign-in link", and a success state with an `Orb` |
| **Checkout success** | Centered `glass-strong` card with an `Orb` that "breathes" (pulse) while waiting, then a check badge and a `brand` "Start the course" |
| **Admin** | Same tokens, denser: `lg:grid-cols-[16rem_1fr]`, glass sidebar, tables on `glass-strong` (opaque enough to read), shadcn defaults for inputs and dialogs. Use `Badge` for status (Draft `outline`, Published `success`, Archived `glass`) |
| **Empty states** | `glass` panel, a small `Orb`, one sentence, one `pill` action |
| **Loading** | shadcn `Skeleton` on glass panels with the same radii as the final content |

## 8. Dark mode

- Driven by `next-themes` (class strategy). Default is the system setting; `ThemeToggle` sits in the header.
- Dark is the same slate hues at night: `#121B21` canvas, sky `#2B3C46 → #172229`, smoky glass, and the same royal-blue action.
- When adding colors, define both the `:root` and the `.dark` value. Check `/design-system` in both modes before shipping.

## 9. Accessibility

- Body text on glass must stay ≥ 4.5:1. If text gets hard to read over a busy background, switch that card to `glass-strong`.
- White-on-sky (the reference look) is low-contrast on the pale top of the frame. Keep white text in the lower half of `bg-sky`, use `bg-sky-deep` for text-first bands, and add `text-on-sky-shadow` to small white text.
- Every interactive element keeps the visible focus ring (`focus-visible:ring-3 ring-ring/50`); never remove it.
- Decorative pieces (`Wordmark`, `Orb`, `HeroVisual` without an image) are `aria-hidden`. Real images need meaningful `alt` text.
- Icon-only buttons need `aria-label`.
- Motion is disabled automatically for `prefers-reduced-motion`.

## 10. Do / Don't

| Do | Don't |
|---|---|
| One `brand` button per view | Several gradient buttons competing |
| One `glass-strong` card per group | Strong-on-strong, or every card lifted |
| Light (300) display headings | Bold, heavy headlines |
| Tokens and `type-*` utilities | Raw hex colors or one-off font sizes |
| Pills for controls | Square buttons or inputs |
| Orbs as accents (≤ 2 per view) | Orbs as bullet points or decoration everywhere |

## 11. Placeholders to replace before launch
All of these live in `lib/site.ts` unless noted.

- `siteConfig.name` and `wordmark` (currently "Cerulean").
- `siteConfig.heroImage`: currently `/hero-bird.png`, a Higgsfield-generated placeholder (Z Image + background remover). Replace it with your own transparent cut-out when you have one. Portrait, about 3:4, subject centered, and the bottom fades out automatically.
- `siteConfig.studentCount`: the real number, or `null` to hide the avatar stack.
- `siteConfig.supportEmail`.
- Avatars in `app/(marketing)/page.tsx` (`recentStudents`).
- `lib/sample-data.ts`: replaced by database queries in Phase 3–4.

## 12. Adding a new shadcn component
1. `npx shadcn@latest add <name>`. It lands in `components/ui/`, using Base UI and the tokens.
2. Restyle it through tokens or new `cva` variants. Keep the defaults working.
3. Add an example to `app/design-system/page.tsx` and a row to this file.

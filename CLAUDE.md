@AGENTS.md

# Project guide

Single-instructor course platform. Read before working:

- `docs/SPEC.md`: what we're building (approved spec, access rules, data model).
- `docs/plan.md`: phase-by-phase build checklist.
- `docs/DESIGN_SYSTEM.md`: the "Sky & Glass" design system. **Every new page and component must use it.** The live reference is at `/design-system`.

## UI rules (short version)
- Build pages from `components/brand/*`, `components/ui/*` and the tokens and `type-*` utilities in `app/globals.css`. No raw hex colors and no one-off font sizes.
- One `brand` (gradient) button and at most one `glass-strong` card per group or view.
- shadcn here is Base UI–based: there's no `asChild`. Style links with `buttonVariants()`.
- New shared pieces get added to `/design-system` and `docs/DESIGN_SYSTEM.md`.

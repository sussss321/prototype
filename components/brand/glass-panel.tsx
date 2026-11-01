import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The main surface of the design system: a frosted-glass panel.
 * - "glass"  → see-through, for most cards sitting on the sky backdrop
 * - "strong" → near-white and lifted, for the ONE card per group you want noticed
 * - "sky"    → the blue gradient backdrop itself (hero frames, feature bands)
 * - "skyDeep"→ the darker lower half of the sky, for bands with white text near the top
 */
export const glassPanelVariants = cva("relative isolate overflow-hidden", {
  variants: {
    tone: {
      glass: "glass",
      strong: "glass-strong",
      sky: "bg-sky",
      skyDeep: "bg-sky-deep",
    },
    radius: {
      md: "rounded-2xl",
      lg: "rounded-3xl",
      xl: "rounded-4xl",
      frame: "rounded-[1.75rem] md:rounded-[2.5rem]",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5 md:p-6",
      lg: "p-6 md:p-8",
    },
  },
  defaultVariants: { tone: "glass", radius: "lg", padding: "md" },
});

export type GlassPanelProps = React.ComponentProps<"div"> & VariantProps<typeof glassPanelVariants>;

export function GlassPanel({ className, tone, radius, padding, ...props }: GlassPanelProps) {
  return (
    <div
      data-slot="glass-panel"
      className={cn(glassPanelVariants({ tone, radius, padding }), className)}
      {...props}
    />
  );
}

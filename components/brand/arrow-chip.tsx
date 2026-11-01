import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const chipClass =
  "glass inline-grid size-8 shrink-0 place-items-center rounded-full text-current transition-transform duration-200 hover:-translate-y-0.5 hover:translate-x-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * Small round ↗ button pinned to the top-right of a card. Signals "this card opens something".
 * Pass `href` to make it a link (give it a `label` for screen readers); omit it for a decorative chip
 * when the whole card is already a link.
 */
export function ArrowChip({
  href,
  label,
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  if (href) {
    return (
      <Link href={href} aria-label={label} className={cn(chipClass, className)}>
        <ArrowUpRight className="size-4" />
      </Link>
    );
  }
  return (
    <span aria-hidden className={cn(chipClass, className)}>
      <ArrowUpRight className="size-4" />
    </span>
  );
}

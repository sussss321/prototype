import Link from "next/link";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; href: string };

/** Glass capsule of links; the active one sits in a brighter pill. */
export function PillNav({
  items,
  activeHref,
  className,
}: {
  items: readonly NavItem[];
  activeHref?: string;
  className?: string;
}) {
  return (
    <nav aria-label="Main" className={cn("glass text-on-sky-shadow flex items-center gap-1 rounded-full p-1", className)}>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.82rem] text-on-sky-muted transition-colors outline-none hover:text-on-sky focus-visible:ring-3 focus-visible:ring-ring/50",
              active && "bg-white/15 text-tag-foreground ring-1 ring-white/70 hover:text-tag-foreground dark:text-on-sky"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/** Logo mark (two swept wings) + brand name. Mark inherits text color. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" aria-hidden className={cn("h-6 w-10", className)}>
      <path
        d="M2 14.5C9 8 18 6.5 27 8.2c3.6.7 7.4.4 11-1.2-3.2 4.3-8 6.6-13.6 6.4C18 13.1 10.5 13 2 14.5Z"
        fill="currentColor"
      />
      <path
        d="M8 19.5c5.4-3 11.3-3.8 17.6-2.6-4.4 3.5-11.6 4.6-17.6 2.6Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-full text-current outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <LogoMark />
      {showName ? (
        <span className="text-[0.95rem] font-semibold tracking-tight">{siteConfig.name}</span>
      ) : (
        <span className="sr-only">{siteConfig.name} home</span>
      )}
    </Link>
  );
}

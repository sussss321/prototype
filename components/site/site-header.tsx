import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PillNav } from "@/components/brand/pill-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Top bar: logo · glass pill nav · theme toggle + white "Sign in" pill.
 * On the landing page it sits inside the hero frame; elsewhere put it at the top of the page.
 */
export function SiteHeader({ activeHref = "/", className }: { activeHref?: string; className?: string }) {
  return (
    <header className={cn("relative z-20 flex items-center justify-between gap-4 text-on-sky", className)}>
      <Logo />

      <PillNav items={siteConfig.nav} activeHref={activeHref} className="hidden md:flex" />

      <div className="flex items-center gap-2">
        <ThemeToggle className="text-on-sky" />
        <Link href="/login" className={buttonVariants({ variant: "pill", size: "pill-sm" })}>
          Sign in
        </Link>

        {/* Mobile menu: no JS needed */}
        <details className="group relative md:hidden">
          <summary
            aria-label="Open menu"
            className={cn(
              buttonVariants({ variant: "glass", size: "icon-pill" }),
              "list-none text-on-sky [&::-webkit-details-marker]:hidden"
            )}
          >
            <Menu className="size-4" />
          </summary>
          <nav
            aria-label="Main"
            className="glass-strong absolute top-11 right-0 grid w-52 gap-1 rounded-2xl p-2"
          >
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

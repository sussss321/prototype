import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Learn",
    links: [
      { label: "All courses", href: "/#courses" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Billing", href: "/account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pt-6 pb-10 md:px-6">
      <div className="glass grid gap-10 rounded-3xl p-6 md:grid-cols-[1.5fr_1fr_1fr] md:p-8">
        <div className="grid content-start gap-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">{siteConfig.tagline}</p>
          <p className="text-xs text-muted-foreground">
            Payments and receipts are handled securely by Polar.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="grid content-start gap-3">
            <p className="type-eyebrow text-muted-foreground">{col.title}</p>
            <ul className="grid gap-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-foreground/80 hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

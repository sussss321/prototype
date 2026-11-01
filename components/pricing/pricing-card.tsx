import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonOrb, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  featured?: boolean;
  badge?: string;
};

/** One pricing tier. `featured` lifts it (strong glass + brand button) — use on one tier only. */
export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-6 rounded-4xl p-6 md:p-7",
        plan.featured ? "glass-strong lg:-translate-y-4" : "glass"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="type-eyebrow text-muted-foreground">{plan.name}</p>
        {plan.badge ? <Badge variant="soft">{plan.badge}</Badge> : null}
      </div>

      <div className="grid gap-2">
        <p className="type-stat">
          {plan.price}
          <span className="ml-2 text-base font-normal tracking-normal text-muted-foreground">{plan.cadence}</span>
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
      </div>

      <ul className="grid gap-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-tag text-tag-foreground">
              <Check className="size-3" />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={plan.cta.href}
        className={cn(
          buttonVariants({ variant: plan.featured ? "brand" : "pill", size: "pill" }),
          "mt-auto w-full justify-between"
        )}
      >
        <span className="pl-1">{plan.cta.label}</span>
        <ButtonOrb className={plan.featured ? undefined : "bg-brand-gradient text-white"}>
          <ArrowRight />
        </ButtonOrb>
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Plus } from "lucide-react";
import { ArrowChip } from "@/components/brand/arrow-chip";
import { AvatarStack } from "@/components/brand/avatar-stack";
import { GlassPanel } from "@/components/brand/glass-panel";
import { Orb } from "@/components/brand/orb";
import { SectionHeader } from "@/components/brand/section-header";
import { Stat } from "@/components/brand/stat";
import { CourseCard } from "@/components/course/course-card";
import { LessonPlayerPreview } from "@/components/course/lesson-player-preview";
import { PricingCard } from "@/components/pricing/pricing-card";
import { SiteHeader } from "@/components/site/site-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonOrb, buttonVariants } from "@/components/ui/button";
import { sampleCourses, sampleCurriculum } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const semantic = [
  "background",
  "sky-top",
  "sky-haze",
  "sky-mid",
  "sky-bottom",
  "tag",
  "tag-foreground",
  "foreground",
  "primary",
  "secondary",
  "muted",
  "muted-foreground",
  "accent",
  "border",
  "success",
  "warning",
  "destructive",
];
const brand = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-1">
        <h2 className="type-subtitle">{title}</h2>
        {note ? <p className="max-w-[70ch] text-sm text-muted-foreground">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-16 px-4 py-6 md:px-6 md:py-8">
      <SiteHeader activeHref="" />

      <SectionHeader
        eyebrow="Design system"
        title="Sky & glass"
        description="Live reference for every page in the platform. Rules and usage live in docs/DESIGN_SYSTEM.md. If something here looks wrong, fix the token or component, not the page."
      />

      <Block title="Color tokens" note="Use semantic tokens (bg-background, text-muted-foreground…) for UI. Use the brand scale for tints, charts and accents.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {semantic.map((t) => (
            <div key={t} className="glass grid gap-2 rounded-2xl p-2">
              <div className="h-14 rounded-xl border border-glass-border" style={{ background: `var(--${t})` }} />
              <code className="px-1 font-mono text-xs">--{t}</code>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 overflow-hidden rounded-2xl sm:grid-cols-11">
          {brand.map((s) => (
            <div key={s} className="grid h-20 content-end p-2" style={{ background: `var(--brand-${s})` }}>
              <span className={`font-mono text-[10px] ${Number(s) >= 500 ? "text-white" : "text-brand-900"}`}>{s}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Typography" note="Manrope for everything, light (300) for big headings. Cormorant Garamond only for the wordmark and italic accents. Use the type-* utilities instead of ad-hoc sizes.">
        <GlassPanel className="grid gap-6">
          <p className="type-display">
            Display <span className="type-serif-accent text-brand-600 dark:text-brand-300">&amp;</span> hero
          </p>
          <p className="type-title">Section title · type-title</p>
          <p className="type-subtitle">Card title · type-subtitle</p>
          <p className="max-w-[65ch] leading-relaxed">
            Body text · text-base, leading-relaxed. Keep lines near 65 characters. Muted copy uses text-muted-foreground.
          </p>
          <p className="type-eyebrow text-muted-foreground">Eyebrow · type-eyebrow</p>
          <Stat value="42" unit="%" caption="Numbers · type-stat (thin, tabular)" />
          <p className="font-display text-5xl font-light tracking-wide text-brand-400 uppercase">Wordmark</p>
        </GlassPanel>
      </Block>

      <Block title="Buttons" note="Pills everywhere. brand = the one main action per view; pill (white) = secondary; glass = tertiary/toolbar. Links styled as buttons use buttonVariants().">
        <GlassPanel tone="sky" className="flex flex-wrap items-center gap-3">
          <Button variant="brand" size="pill">
            Primary action
            <ButtonOrb>
              <ChevronRight />
            </ButtonOrb>
          </Button>
          <Button variant="brand" size="pill">
            Primary
          </Button>
          <Button variant="pill" size="pill">
            Secondary
          </Button>
          <Button variant="glass" size="pill">
            Glass <ArrowRight />
          </Button>
          <Button variant="brand" size="pill-sm">
            Small
          </Button>
          <Button variant="pill" size="pill-lg">
            Large
          </Button>
          <Button variant="glass" size="icon-pill" aria-label="Add">
            <Plus />
          </Button>
          <Link href="/" className={buttonVariants({ variant: "pill", size: "pill-sm" })}>
            Link as button
          </Link>
          <Button variant="brand" size="pill" disabled>
            Disabled
          </Button>
        </GlassPanel>
      </Block>

      <Block title="Badges & chips">
        <GlassPanel tone="sky" className="flex flex-wrap items-center gap-3">
          <Badge variant="glass">Free previews</Badge>
          <Badge variant="soft">Best value</Badge>
          <Badge variant="success">Completed</Badge>
          <Badge variant="outline">Draft</Badge>
          <Badge variant="destructive">Refunded</Badge>
          <ArrowChip href="/" label="Open" />
          <AvatarStack
            people={[{ name: "Amara Obi" }, { name: "Jonas Weber" }, { name: "Priya Nair" }]}
            label="Students"
            count={1240}
          />
        </GlassPanel>
      </Block>

      <Block title="Surfaces" note="glass = default card on the sky. strong = the one lifted card per group. sky = backdrop for hero frames and feature bands. Never stack strong on strong.">
        <GlassPanel tone="sky" radius="xl" className="grid gap-4 md:grid-cols-3">
          <GlassPanel className="grid min-h-36 content-between">
            <ArrowChip className="justify-self-end" />
            <p className="type-subtitle">tone=&quot;glass&quot;</p>
          </GlassPanel>
          <GlassPanel tone="strong" className="grid min-h-36 content-between">
            <Orb className="w-12" />
            <p className="type-subtitle">tone=&quot;strong&quot;</p>
          </GlassPanel>
          <GlassPanel className="grid min-h-36 content-end">
            <Stat value="92" unit="%" caption="Stat inside a glass card" />
          </GlassPanel>
        </GlassPanel>
      </Block>

      <Block title="Orb" note="The recurring 3D object. Hero stand-in, card icons, empty states. Max two per view.">
        <GlassPanel tone="sky" className="flex flex-wrap items-end gap-8">
          <Orb className="w-8" glow={false} />
          <Orb className="w-12" />
          <Orb className="w-24" />
          <Orb className="w-40" />
        </GlassPanel>
      </Block>

      <Block title="Course card">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sampleCourses.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </Block>

      <Block title="Pricing cards">
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          <PricingCard
            plan={{
              name: "Regular",
              price: "$25",
              cadence: "per course",
              description: "Default tier uses glass + white pill button.",
              features: ["Feature one", "Feature two"],
              cta: { label: "Choose", href: "/design-system" },
            }}
          />
          <PricingCard
            plan={{
              name: "Featured",
              price: "$250",
              cadence: "one time",
              description: "Featured tier uses strong glass + brand button. One per row.",
              features: ["Feature one", "Feature two", "Feature three"],
              cta: { label: "Choose", href: "/design-system" },
              featured: true,
              badge: "Best value",
            }}
          />
        </div>
      </Block>

      <Block title="Lesson player (look for Phase 6)">
        <GlassPanel tone="sky" radius="xl" padding="sm">
          <LessonPlayerPreview curriculum={sampleCurriculum} />
        </GlassPanel>
      </Block>

      <Block title="Accordion">
        <GlassPanel padding="sm" className="md:px-6">
          <Accordion>
            <AccordionItem value="a" className="border-glass-border">
              <AccordionTrigger className="py-4 text-base hover:no-underline">Question goes here</AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">Answer in muted text.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b" className="border-glass-border">
              <AccordionTrigger className="py-4 text-base hover:no-underline">Another question</AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground">Another answer.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </GlassPanel>
      </Block>
    </div>
  );
}

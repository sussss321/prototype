import Link from "next/link";
import { ArrowRight, ChevronRight, Eye, FileCode2, History, LockOpen, TrendingUp } from "lucide-react";
import { ArrowChip } from "@/components/brand/arrow-chip";
import { AvatarStack } from "@/components/brand/avatar-stack";
import { GlassPanel } from "@/components/brand/glass-panel";
import { HeroVisual } from "@/components/brand/hero-visual";
import { Orb } from "@/components/brand/orb";
import { SectionHeader } from "@/components/brand/section-header";
import { Stat } from "@/components/brand/stat";
import { Wordmark } from "@/components/brand/wordmark";
import { CourseCard } from "@/components/course/course-card";
import { LessonPlayerPreview } from "@/components/course/lesson-player-preview";
import { PricingCard, type PricingPlan } from "@/components/pricing/pricing-card";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ButtonOrb, buttonVariants } from "@/components/ui/button";
import { formatUsd } from "@/lib/format";
import { sampleCourses, sampleCurriculum, totalSampleLessons } from "@/lib/sample-data";
import { siteConfig } from "@/lib/site";

// PLACEHOLDER avatars until real students exist.
const recentStudents = [{ name: "Amara Obi" }, { name: "Jonas Weber" }, { name: "Priya Nair" }, { name: "Leo Martins" }];

const features = [
  {
    icon: FileCode2,
    title: "Source code and slides",
    body: "Every lesson comes with the code and slides from the video, ready to download and run.",
  },
  {
    icon: History,
    title: "Pick up where you left off",
    body: "Videos resume at the second you stopped, on any device.",
  },
  {
    icon: Eye,
    title: "Free previews",
    body: "Watch selected lessons before you buy. No account needed.",
  },
  {
    icon: TrendingUp,
    title: "Progress you can see",
    body: "Lessons tick off as you finish them, with a percentage for every course.",
  },
];

const plans: PricingPlan[] = [
  {
    name: "Single course",
    price: formatUsd(sampleCourses[0]?.priceUsd ?? 25),
    cadence: "per course",
    description: "Own one course for good.",
    features: ["That course, forever", "All its lessons, code and slides", "Progress tracking and resume"],
    cta: { label: "Choose a course", href: "/#courses" },
  },
  {
    name: "Lifetime",
    price: formatUsd(siteConfig.pricing.lifetime),
    cadence: "one time",
    description: "Every course I've made, and every course I'll make.",
    features: [
      "Every current and future course",
      "All code, slides and downloads",
      "One payment, no renewals",
      "On monthly? It stops automatically when you upgrade",
    ],
    cta: { label: "Get lifetime access", href: "/api/checkout?plan=lifetime" },
    featured: true,
    badge: "Best value",
  },
  {
    name: "Monthly",
    price: formatUsd(siteConfig.pricing.monthly),
    cadence: "per month",
    description: "Every course while you're subscribed.",
    features: [
      "Every course, including new ones",
      "Cancel any time in the billing portal",
      "Keep access until your paid month ends",
    ],
    cta: { label: "Go monthly", href: "/api/checkout?plan=monthly" },
  },
];

const faqs = [
  {
    q: "What's the difference between monthly and lifetime?",
    a: "Both unlock every course. Monthly is $50 a month for as long as you stay subscribed. Lifetime is a single $250 payment that covers every course, including ones released later.",
  },
  {
    q: "What happens if I cancel my monthly plan?",
    a: "You keep full access until the end of the month you've paid for. After that, paid lessons lock again. Your progress is saved in case you come back.",
  },
  {
    q: "I'm on monthly. Can I switch to lifetime?",
    a: "Yes. Buy lifetime and your monthly subscription stops right away, so you're never charged for both.",
  },
  {
    q: "Can I try a course before buying?",
    a: "Yes. Lessons marked Preview are free to watch, no account needed.",
  },
  {
    q: "How do I manage billing or get receipts?",
    a: "Receipts arrive by email after every payment. Use “Billing” in your account to update your card, cancel, or download invoices.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ───────────── Hero frame ───────────── */}
      <div className="p-2.5 sm:p-4 md:p-5">
        <section
          aria-labelledby="hero-title"
          className="bg-sky relative isolate flex min-h-[880px] flex-col overflow-hidden rounded-[1.75rem] px-4 pt-4 pb-6 sm:min-h-[940px] sm:px-6 md:rounded-[2.5rem] md:px-10 md:pt-6 md:pb-10 lg:min-h-[780px]"
        >
          <SiteHeader activeHref="/" />

          <Wordmark text={siteConfig.wordmark} className="top-[96px] md:top-[120px] lg:top-[24%]" />

          <HeroVisual
            image={siteConfig.heroImage}
            className="absolute top-[100px] left-1/2 aspect-[3/4] h-[330px] -translate-x-1/2 sm:h-[460px] lg:top-auto lg:bottom-0 lg:h-[96%]"
          />

          <div className="relative z-10 mt-auto grid gap-10 pt-[350px] sm:pt-[480px] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:pt-0">
            {/* Left: message */}
            <div className="grid max-w-xl gap-6 text-on-sky">
              <h1 id="hero-title" className="type-display text-on-sky-shadow">
                Learn to build
                <span className="block pl-[0.9em]">
                  <span className="mr-[0.18em] text-white/60">&amp;</span>
                  actually ship
                </span>
              </h1>
              <p className="text-on-sky-shadow max-w-sm text-sm leading-relaxed text-on-sky-muted">
                {siteConfig.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/#courses" className={buttonVariants({ variant: "brand", size: "pill" })}>
                  Browse courses
                  <ButtonOrb>
                    <ChevronRight />
                  </ButtonOrb>
                </Link>
                <Link href="/#pricing" className={buttonVariants({ variant: "pill", size: "pill" })}>
                  See pricing
                </Link>
              </div>
            </div>

            {/* Right: proof + highlight cards */}
            <div className="grid gap-5 lg:justify-items-end">
              {siteConfig.studentCount != null ? (
                <AvatarStack people={recentStudents} label="Students" count={siteConfig.studentCount} />
              ) : null}

              <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
                <GlassPanel padding="sm" className="grid min-h-40 content-between gap-4 bg-sky-bottom/25 text-on-sky sm:w-52 lg:min-h-44 xl:w-60">
                  <div className="flex items-start justify-between">
                    <span className="glass grid size-11 place-items-center rounded-2xl">
                      <LockOpen className="size-5" />
                    </span>
                    <ArrowChip href="/#courses" label="See free previews" />
                  </div>
                  <div className="grid gap-2">
                    <Badge variant="soft" className="w-fit">
                      Free previews
                    </Badge>
                    <p className="type-subtitle text-on-sky-shadow text-[1.05rem]">Watch before you buy</p>
                  </div>
                </GlassPanel>

                <GlassPanel tone="strong" padding="sm" className="grid min-h-48 content-between gap-4 sm:w-52 lg:min-h-52 xl:w-60">
                  <div className="flex items-start justify-between">
                    <Orb className="w-12" />
                    <ArrowChip href="/#pricing" label="See lifetime access" />
                  </div>
                  <div className="grid gap-1.5">
                    <p className="type-subtitle text-[1.05rem]">Lifetime access</p>
                    <p className="text-xs leading-snug text-muted-foreground">
                      Every course, including the ones I haven&apos;t made yet.
                    </p>
                  </div>
                </GlassPanel>

                <GlassPanel padding="sm" className="text-on-sky-shadow grid min-h-40 content-end bg-sky-bottom/25 text-on-sky sm:w-52 lg:min-h-44 xl:w-60">
                  <ArrowChip href="/#courses" label="Browse all lessons" className="absolute top-4 right-4" />
                  <Stat
                    value={totalSampleLessons}
                    caption={`Lessons across ${sampleCourses.length} courses, with more on the way.`}
                  />
                </GlassPanel>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="mx-auto grid w-full max-w-7xl gap-24 px-4 py-20 md:gap-32 md:px-6 md:py-28">
        {/* ───────────── Courses ───────────── */}
        <section id="courses" aria-labelledby="courses-title" className="grid scroll-mt-8 gap-10">
          <SectionHeader
            id="courses-title"
            eyebrow="Courses"
            title="Pick one course, or get them all"
            description="Each course is a complete project, filmed step by step. Every course has free preview lessons you can watch first."
            action={
              <Link href="/#pricing" className={buttonVariants({ variant: "glass", size: "pill-sm" })}>
                Compare plans <ArrowRight />
              </Link>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sampleCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>

        {/* ───────────── What's inside ───────────── */}
        <section id="inside" aria-labelledby="inside-title" className="grid scroll-mt-8 gap-10">
          <SectionHeader
            id="inside-title"
            eyebrow="What's inside"
            title="A player built for actually finishing"
            description="Short, focused lessons with everything you need next to the video."
          />
          <GlassPanel tone="sky" radius="xl" padding="sm" className="md:p-5">
            <LessonPlayerPreview curriculum={sampleCurriculum} />
          </GlassPanel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => (
              <GlassPanel key={title} className="grid content-start gap-4">
                <span className="glass-strong grid size-11 place-items-center rounded-2xl text-brand-600 dark:text-brand-300">
                  <Icon className="size-5" />
                </span>
                <div className="grid gap-1.5">
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </GlassPanel>
            ))}
          </div>
        </section>

        {/* ───────────── Pricing ───────────── */}
        <section id="pricing" aria-labelledby="pricing-title" className="grid scroll-mt-8 gap-12">
          <SectionHeader
            id="pricing-title"
            eyebrow="Pricing"
            title="Simple pricing, three ways in"
            description="Buy a single course, subscribe for everything, or pay once and own it all."
            align="center"
          />
          <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        {/* ───────────── FAQ ───────────── */}
        <section id="faq" aria-labelledby="faq-title" className="grid scroll-mt-8 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            className="self-start"
            id="faq-title"
            eyebrow="FAQ"
            title="Questions, answered"
            description={
              <>
                Something else? Email <span className="font-medium text-foreground">{siteConfig.supportEmail}</span>.
              </>
            }
          />
          <GlassPanel padding="sm" className="md:px-6">
            <Accordion>
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q} className="border-glass-border">
                  <AccordionTrigger className="py-4 text-base hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassPanel>
        </section>

        {/* ───────────── Closing call to action ───────────── */}
        <GlassPanel tone="skyDeep" radius="frame" padding="lg" className="grid min-h-80 place-items-center text-center md:py-16">
          <Wordmark text={siteConfig.wordmark} className="bottom-[-0.12em] text-[clamp(4rem,14vw,11rem)]" />
          <Orb className="absolute -top-10 -left-10 w-40 opacity-80" />
          <Orb className="absolute -right-6 -bottom-12 w-28 opacity-80" glow={false} />
          <div className="text-on-sky-shadow relative grid max-w-xl justify-items-center gap-6 text-on-sky">
            <h2 className="type-title">Start with a free lesson</h2>
            <p className="text-on-sky-muted">
              Open any course and watch the preview lessons. When you&apos;re ready, unlock the rest.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/#courses" className={buttonVariants({ variant: "brand", size: "pill" })}>
                Browse courses
                <ButtonOrb>
                  <ChevronRight />
                </ButtonOrb>
              </Link>
              <Link href="/#pricing" className={buttonVariants({ variant: "pill", size: "pill" })}>
                See pricing
              </Link>
            </div>
          </div>
        </GlassPanel>
      </main>

      <SiteFooter />
    </>
  );
}

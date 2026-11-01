/**
 * SAMPLE DATA for building the UI before the database exists (Phase 3 replaces this).
 * Shapes mirror the real tables in docs/SPEC.md §4 so components won't need to change.
 */

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export type CourseSummary = {
  slug: string;
  title: string;
  subtitle: string;
  level: CourseLevel;
  lessonCount: number;
  freePreviewCount: number;
  durationMinutes: number;
  priceUsd: number;
  /** Tint for the generated cover (oklch hue, 200–290 stays on-brand). */
  coverHue: number;
};

export const sampleCourses: CourseSummary[] = [
  {
    slug: "nextjs-zero-to-production",
    title: "Next.js from Zero to Production",
    subtitle: "Routing, data, caching and deploys, built around one real app from the first commit.",
    level: "Beginner",
    lessonCount: 42,
    freePreviewCount: 3,
    durationMinutes: 410,
    priceUsd: 25,
    coverHue: 245,
  },
  {
    slug: "typescript-for-real-projects",
    title: "TypeScript for Real Projects",
    subtitle: "Types that catch bugs without slowing you down: generics, narrowing and safe APIs.",
    level: "Intermediate",
    lessonCount: 28,
    freePreviewCount: 2,
    durationMinutes: 265,
    priceUsd: 25,
    coverHue: 262,
  },
  {
    slug: "saas-with-postgres",
    title: "Build a SaaS with Postgres",
    subtitle: "Auth, payments, webhooks and a data model that survives your first thousand users.",
    level: "Advanced",
    lessonCount: 36,
    freePreviewCount: 2,
    durationMinutes: 380,
    priceUsd: 25,
    coverHue: 228,
  },
];

export type LessonPreview = {
  title: string;
  durationMinutes: number;
  state: "done" | "current" | "locked" | "preview";
};

/** A short curriculum used by the "What's inside" player mock-up. */
export const sampleCurriculum: { section: string; lessons: LessonPreview[] }[] = [
  {
    section: "Getting started",
    lessons: [
      { title: "What we're building", durationMinutes: 4, state: "done" },
      { title: "Project setup", durationMinutes: 9, state: "done" },
      { title: "Your first route", durationMinutes: 12, state: "current" },
    ],
  },
  {
    section: "Data and caching",
    lessons: [
      { title: "Fetching on the server", durationMinutes: 14, state: "preview" },
      { title: "Caching that stays fresh", durationMinutes: 16, state: "locked" },
    ],
  },
];

export const totalSampleLessons = sampleCourses.reduce((sum, c) => sum + c.lessonCount, 0);

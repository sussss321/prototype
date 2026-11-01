/**
 * Site-wide settings. Change the brand name, copy and hero image here.
 * Values marked PLACEHOLDER must be replaced with real ones before launch.
 */
export const siteConfig = {
  // PLACEHOLDER brand name. The wordmark is the giant serif text behind the hero.
  name: "Cerulean",
  wordmark: "Cerulean",
  tagline: "Video courses for people who want to build and ship real apps.",
  description:
    "Hands-on video courses with source code, slides and progress tracking. Buy one course, go monthly, or get lifetime access to everything.",

  // Hero picture. Set to { src: "/hero.png", alt: "..." } once you have an image in /public.
  // A transparent cut-out (PNG/WebP) of a person or object works best. Until then a glass orb is shown.
  // Generated with Higgsfield (Z Image + background remover), saved in /public.
  heroImage: { src: "/hero-bluebird.png", alt: "A bluebird with vivid blue feathers and a warm peach chest" } as null | { src: string; alt: string },

  nav: [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/#courses" },
    { label: "What's inside", href: "/#inside" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],

  pricing: {
    monthly: 50,
    lifetime: 250,
  },

  // PLACEHOLDER social proof. Replace with the real number or set to null to hide it.
  studentCount: 1240 as number | null,

  supportEmail: "hello@example.com", // PLACEHOLDER
} as const;

export type SiteConfig = typeof siteConfig;

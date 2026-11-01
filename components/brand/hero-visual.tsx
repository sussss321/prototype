import Image from "next/image";
import { cn } from "@/lib/utils";
import { Orb } from "./orb";

/**
 * The centerpiece of a hero frame. With an image, it shows the picture fading into the sky at the
 * bottom (use a transparent cut-out). Without one, it shows the glass orb composition.
 */
export function HeroVisual({
  image,
  className,
}: {
  image?: { src: string; alt: string } | null;
  className?: string;
}) {
  if (image) {
    return (
      <div className={cn("relative", className)}>
        <div
          className="absolute inset-0"
          // Fade the bottom, and the left edge where the photo crops the wing
          style={{
            maskImage:
              "linear-gradient(to bottom, black 78%, transparent 100%), linear-gradient(to right, transparent 0%, black 9%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 78%, transparent 100%), linear-gradient(to right, transparent 0%, black 9%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 560px, 70vw"
            // Soft, slightly luminous like the reference photo
            className="object-contain object-bottom brightness-[1.06] contrast-[0.94] saturate-[1.12]"
          />
        </div>
        {/* White mist the subject dissolves into (bottom center glow in the reference) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-10%] bottom-[-10%] h-[24%] rounded-[50%] bg-sky-glow/70 blur-2xl"
        />
      </div>
    );
  }

  return (
    <div aria-hidden className={cn("relative grid place-items-center", className)}>
      {/* halo */}
      <div className="absolute inset-[8%] rounded-full bg-sky-haze/70 blur-3xl dark:bg-brand-600/25" />
      {/* orbit ring */}
      <div className="absolute inset-[4%] rounded-full border border-white/50 dark:border-white/10" />
      <div className="absolute inset-[16%] rounded-full border border-white/35 dark:border-white/[0.07]" />
      <Orb className="w-[62%]" />
      {/* small satellite orb */}
      <Orb className="absolute top-[14%] right-[10%] w-[12%]" glow={false} />
    </div>
  );
}

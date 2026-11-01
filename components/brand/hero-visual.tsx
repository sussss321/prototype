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
      <div
        className={cn("relative", className)}
        style={{
          maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 80vw"
          className="object-contain object-bottom"
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

import Image from "next/image";
import { Orb } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

/**
 * Course thumbnail. Uses the real image when there is one; otherwise a generated sky cover
 * tinted by `hue`, so courses without artwork still look intentional.
 */
export function CourseCover({
  title,
  hue = 248,
  image,
  className,
  children,
}: {
  title: string;
  hue?: number;
  image?: string | null;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("relative aspect-[16/10] overflow-hidden rounded-2xl", className)}
      style={
        image
          ? undefined
          : {
              // Same sky as the hero frame; `hue` only tilts the gradient so covers differ slightly.
              background: `radial-gradient(70% 45% at 35% 30%, var(--sky-haze), transparent 70%), linear-gradient(${150 + (hue - 245) * 2}deg, var(--sky-top) 0%, var(--sky-top) 30%, var(--sky-mid) 65%, var(--sky-bottom) 100%)`,
            }
      }
    >
      {image ? (
        <Image src={image} alt="" fill sizes="(min-width: 1024px) 400px, 90vw" className="object-cover" />
      ) : (
        <>
          <Orb className="absolute -right-[6%] -bottom-[18%] w-[48%]" />
          <Orb className="absolute top-[18%] left-[12%] w-[11%]" glow={false} />
          <span className="sr-only">{title}</span>
        </>
      )}
      {children ? <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">{children}</div> : null}
    </div>
  );
}

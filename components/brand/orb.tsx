import { cn } from "@/lib/utils";

/**
 * Glossy blue sphere. The brand's recurring 3D object: hero stand-in, card icon, empty states.
 * Pure CSS, so it costs nothing to load. Size it with width classes (it keeps a 1:1 ratio).
 */
export function Orb({ className, glow = true }: { className?: string; glow?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("relative aspect-square w-16 shrink-0 rounded-full", className)}
      style={{
        // Blues sampled from the reference's glossy orb icon
        background: [
          "radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.95) 0%, rgb(221 240 255 / 0.85) 7%, transparent 26%)",
          "radial-gradient(circle at 70% 78%, rgb(118 186 242 / 0.9) 0%, transparent 42%)",
          "radial-gradient(circle at 46% 44%, #4a9bf0 0%, #3171f6 50%, #1f479b 100%)",
        ].join(", "),
        boxShadow: [
          "inset -0.6em -0.9em 1.6em rgb(28 55 112 / 0.55)",
          "inset 0.5em 0.5em 1.2em rgb(255 255 255 / 0.35)",
          glow ? "0 1.6em 3.2em -1.2em rgb(49 113 246 / 0.55)" : "",
        ]
          .filter(Boolean)
          .join(", "),
        fontSize: "clamp(6px, 1.2vw, 14px)",
      }}
    >
      {/* soft ring highlight */}
      <div
        className="absolute inset-[6%] rounded-full"
        style={{
          background:
            "conic-gradient(from 210deg, transparent 0deg, rgb(255 255 255 / 0.28) 40deg, transparent 90deg, transparent 360deg)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

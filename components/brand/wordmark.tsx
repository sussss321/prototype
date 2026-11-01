import { cn } from "@/lib/utils";

/**
 * The oversized serif brand name that sits *behind* hero content.
 * Decorative only: hidden from screen readers. Place inside a `relative overflow-hidden` parent.
 */
export function Wordmark({ text, className }: { text: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "type-wordmark pointer-events-none absolute inset-x-0 text-center whitespace-nowrap select-none",
        className
      )}
    >
      {text}
    </div>
  );
}

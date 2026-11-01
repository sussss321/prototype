import { cn } from "@/lib/utils";

/** Thin, oversized number with a small unit, like "42%" in the reference. */
export function Stat({
  value,
  unit,
  caption,
  className,
}: {
  value: string | number;
  unit?: string;
  caption?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <p className="type-stat">
        {value}
        {unit ? <span className="ml-1 align-top text-[0.42em] font-light tracking-normal">{unit}</span> : null}
      </p>
      {caption ? <p className="max-w-[24ch] text-xs leading-snug opacity-85">{caption}</p> : null}
    </div>
  );
}

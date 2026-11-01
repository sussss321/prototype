import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Eyebrow pill + light title + muted description. Use at the top of every page section. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className
      )}
    >
      <div className={cn("grid max-w-2xl gap-4", align === "center" && "justify-items-center")}>
        {eyebrow ? (
          <Badge variant="soft" className="type-eyebrow h-7 px-3">
            {eyebrow}
          </Badge>
        ) : null}
        <h2 id={id} className="type-title">
          {title}
        </h2>
        {description ? (
          <p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

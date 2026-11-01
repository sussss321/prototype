import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";

type Person = { name: string; image?: string };

const tints = [250, 228, 262, 205, 275];

/** Overlapping avatars plus a glass pill with a count, e.g. "Students +1,240". */
export function AvatarStack({
  people,
  label,
  count,
  className,
}: {
  people: Person[];
  label: string;
  count?: number | null;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {people.slice(0, 4).map((p, i) => (
          <Avatar key={p.name} className="size-10 ring-2 ring-white/80 dark:ring-white/20">
            {p.image ? <AvatarImage src={p.image} alt="" /> : null}
            <AvatarFallback
              className="text-[11px] font-semibold tracking-tight text-white"
              style={{
                background: `linear-gradient(135deg, oklch(0.72 0.12 ${tints[i % tints.length]}), oklch(0.48 0.17 ${tints[i % tints.length] + 10}))`,
              }}
            >
              {p.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="glass -ml-2 flex h-9 items-center gap-2 rounded-full pr-4 pl-5 text-sm text-on-sky">
        <span className="text-on-sky-muted">{label}</span>
        {count != null && (
          <span className="font-semibold tabular-nums">+{formatCount(count)}</span>
        )}
      </div>
    </div>
  );
}

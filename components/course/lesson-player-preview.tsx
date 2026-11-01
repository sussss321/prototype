import { Check, Lock, Play, PlayCircle } from "lucide-react";
import { Orb } from "@/components/brand/orb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LessonPreview } from "@/lib/sample-data";

/**
 * Static picture of the lesson player (video + curriculum sidebar) for marketing pages.
 * It also shows the intended look of the real player in Phase 6.
 */
export function LessonPlayerPreview({
  curriculum,
  className,
}: {
  curriculum: { section: string; lessons: LessonPreview[] }[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 lg:grid-cols-[1.6fr_1fr]", className)}>
      {/* Video */}
      <div className="glass-strong relative grid min-h-64 overflow-hidden rounded-3xl p-3">
        <div className="bg-sky relative grid aspect-video place-items-center overflow-hidden rounded-2xl">
          <Orb className="absolute -top-[20%] -left-[8%] w-[40%] opacity-90" />
          <span className="glass-strong relative grid size-16 place-items-center rounded-full">
            <Play className="size-6 translate-x-0.5 fill-current text-brand-600" />
          </span>
          {/* progress */}
          <div className="absolute inset-x-4 bottom-4 grid gap-2">
            <div className="text-on-sky-shadow flex justify-between text-xs font-medium text-on-sky tabular-nums">
              <span>7:48</span>
              <span>12:10</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/50 dark:bg-white/15">
              <div className="h-full w-[64%] rounded-full bg-brand-gradient" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-4 pb-1">
          <div>
            <p className="text-xs text-muted-foreground">Lesson 3 · Getting started</p>
            <p className="font-medium">Your first route</p>
          </div>
          <Badge variant="soft">Resumes at 7:48</Badge>
        </div>
      </div>

      {/* Curriculum */}
      <div className="glass grid content-start gap-4 rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Course content</p>
          <span className="text-xs text-muted-foreground tabular-nums">40% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/45 dark:bg-white/10">
          <div className="h-full w-[40%] rounded-full bg-brand-gradient" />
        </div>
        {curriculum.map((s) => (
          <div key={s.section} className="grid gap-1">
            <p className="type-eyebrow px-2 pb-1 text-muted-foreground">{s.section}</p>
            {s.lessons.map((l) => (
              <div
                key={l.title}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-2 text-sm",
                  l.state === "current" && "glass-strong"
                )}
              >
                <LessonStateIcon state={l.state} />
                <span className={cn("flex-1", l.state === "locked" && "text-muted-foreground")}>{l.title}</span>
                {l.state === "preview" ? <Badge variant="soft">Preview</Badge> : null}
                <span className="text-xs text-muted-foreground tabular-nums">{l.durationMinutes}m</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonStateIcon({ state }: { state: LessonPreview["state"] }) {
  const base = "grid size-6 shrink-0 place-items-center rounded-full";
  switch (state) {
    case "done":
      return (
        <span className={cn(base, "bg-brand-gradient text-white")} aria-label="Completed">
          <Check className="size-3.5" />
        </span>
      );
    case "current":
      return (
        <span className={cn(base, "bg-tag text-tag-foreground")} aria-label="In progress">
          <PlayCircle className="size-3.5" />
        </span>
      );
    case "locked":
      return (
        <span className={cn(base, "bg-white/40 text-muted-foreground dark:bg-white/5")} aria-label="Locked">
          <Lock className="size-3" />
        </span>
      );
    default:
      return (
        <span className={cn(base, "bg-white text-brand-600 dark:bg-white/10 dark:text-brand-300")} aria-label="Free preview">
          <Play className="size-3 fill-current" />
        </span>
      );
  }
}

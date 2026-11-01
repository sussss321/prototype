import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import { ArrowChip } from "@/components/brand/arrow-chip";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatUsd } from "@/lib/format";
import type { CourseSummary } from "@/lib/sample-data";
import { CourseCover } from "./course-cover";

/** Catalog card. The whole card is one link to the course's sales page. */
export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group glass flex flex-col gap-4 rounded-3xl p-3 pb-5 transition-transform duration-300 outline-none hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <CourseCover title={course.title} hue={course.coverHue}>
        <Badge variant="soft">{course.level}</Badge>
        <ArrowChip className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </CourseCover>

      <div className="grid gap-2 px-2">
        <h3 className="type-subtitle">{course.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{course.subtitle}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 px-2 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <PlayCircle className="size-4" /> {course.lessonCount} lessons
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" /> {formatDuration(course.durationMinutes)}
          </span>
        </div>
        <span className="font-semibold tabular-nums">{formatUsd(course.priceUsd)}</span>
      </div>
    </Link>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { COURSE_CATEGORIES, MOCK_COURSES } from "@/lib/courses-data";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSavedCourses } from "@/hooks/use-saved-courses";
import { useEnrolledCourses } from "@/hooks/use-enrolled-courses";
import type { Course, CourseCategory } from "@/types";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = ["Any", "Under 10h", "10–30h", "30h+"];

export default function LearningPage() {
  const [category, setCategory] = useState<CourseCategory | "All">("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [level, setLevel] = useState<string>("Any");
  const [duration, setDuration] = useState<string>("Any");

  const { isSaved, toggleSaved } = useSavedCourses();
  const { enroll, isEnrolled } = useEnrolledCourses();

  const filtered = useMemo(() => {
    let list = [...MOCK_COURSES];
    if (category !== "All") {
      list = list.filter((c) => c.category === category);
    }
    if (freeOnly) {
      list = list.filter((c) => c.price === "Free");
    }
    if (level !== "Any") {
      list = list.filter((c) => c.level === level);
    }
    if (duration !== "Any") {
      const parseH = (s: string) => parseInt(s.replace("h", ""), 10) || 0;
      if (duration === "Under 10h") list = list.filter((c) => parseH(c.duration) < 10);
      else if (duration === "10–30h")
        list = list.filter((c) => {
          const h = parseH(c.duration);
          return h >= 10 && h <= 30;
        });
      else if (duration === "30h+") list = list.filter((c) => parseH(c.duration) > 30);
    }
    return list;
  }, [category, freeOnly, level, duration]);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Learning Portal</h1>
          <p className="mt-2 text-muted-foreground">
            Courses to bridge skill gaps and prepare for internships.
          </p>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Category:</span>
              {["All", ...COURSE_CATEGORIES].map((c) => (
                <Button
                  key={c}
                  variant={category === c ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(c as CourseCategory | "All")}
                >
                  {c}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="free" checked={freeOnly} onCheckedChange={setFreeOnly} />
                <Label htmlFor="free" className="text-sm">Free only</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Course grid */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                onEnroll={enroll}
                isEnrolled={isEnrolled(course.id)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center"
            >
              <p className="text-muted-foreground">No courses match your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setCategory("All");
                  setFreeOnly(false);
                  setLevel("Any");
                  setDuration("Any");
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

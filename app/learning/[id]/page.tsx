"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Star, User, CheckCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MOCK_COURSES } from "@/lib/courses-data";
import { useEnrolledCourses } from "@/hooks/use-enrolled-courses";
import { useSavedCourses } from "@/hooks/use-saved-courses";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { enroll, isEnrolled } = useEnrolledCourses();
  const { toggleSaved, isSaved } = useSavedCourses();

  const course = MOCK_COURSES.find((c) => c.id === id);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Course not found</h2>
        <Button asChild className="mt-4">
          <Link href="/learning">Back to Learning Portal</Link>
        </Button>
      </div>
    );
  }

  const priceLabel =
    course.price === "Free" ? "Free" : `₹${course.price.toLocaleString()}`;

  const handleEnroll = () => {
    enroll(course);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
            <Link href="/learning" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to courses
            </Link>
          </Button>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative aspect-video w-full bg-muted">
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/30 to-violet-500/30"
                style={{
                  backgroundImage: course.thumbnail?.startsWith("http")
                    ? `url(${course.thumbnail})`
                    : undefined,
                  backgroundSize: "cover",
                }}
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge className="bg-background/90">{priceLabel}</Badge>
                <Badge variant="secondary">{course.level}</Badge>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {course.title}
              </h1>
              <p className="mt-4 text-muted-foreground">{course.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {course.instructor}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {course.rating}
                </span>
              </div>

              {/* Curriculum */}
              {course.curriculum && course.curriculum.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold">Curriculum</h2>
                  <ul className="mt-4 space-y-3">
                    {course.curriculum.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
                      >
                        <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                        <span className="flex-1 font-medium">{item.title}</span>
                        {item.duration && (
                          <span className="text-sm text-muted-foreground">
                            {item.duration}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructor */}
              <div className="mt-8 flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {course.instructor
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Instructor</p>
                  <p className="text-muted-foreground">{course.instructor}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="min-w-[200px]"
                  onClick={handleEnroll}
                  disabled={isEnrolled(course.id)}
                >
                  {isEnrolled(course.id) ? "Enrolled" : "Enroll now"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleSaved(course)}
                >
                  {isSaved(course.id) ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save for later
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

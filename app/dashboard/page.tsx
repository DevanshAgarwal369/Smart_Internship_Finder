"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  BookOpen,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InternshipCard } from "@/components/internship-card";
import { CourseCard } from "@/components/course-card";
import { AISidebar } from "@/components/ai-sidebar";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useSavedCourses } from "@/hooks/use-saved-courses";
import { useEnrolledCourses } from "@/hooks/use-enrolled-courses";
import { MOCK_COURSES } from "@/lib/courses-data";
import type { Internship } from "@/types";

// Mock recommended internships for dashboard (would come from API in production)
const MOCK_REC_INTERNSHIPS: Internship[] = [
  {
    id: "rec-1",
    company_name: "TechCorp India",
    role: "Frontend Developer Intern",
    location: "Bangalore",
    stipend: "25k/mo",
    duration: "6 months",
    skills_required: ["React", "TypeScript", "CSS"],
    eligibility_score: 85,
    is_eligible: true,
  },
  {
    id: "rec-2",
    company_name: "DataFlow",
    role: "Data Science Intern",
    location: "Remote",
    stipend: "30k/mo",
    duration: "3 months",
    skills_required: ["Python", "ML", "SQL"],
    eligibility_score: 72,
    is_eligible: true,
  },
];

const MOCK_REC_COURSES = MOCK_COURSES.slice(0, 3);

export default function DashboardPage() {
  const [aiOpen, setAiOpen] = useState(false);
  const { bookmarkedIds, toggle: toggleBookmark, isBookmarked } = useBookmarks();
  const { savedCourses } = useSavedCourses();
  const { enrolledCourses, isEnrolled } = useEnrolledCourses();

  // Saved internships: we only have IDs in bookmarks; for display we use mock cards with minimal data
  const savedInternshipIds = Array.from(bookmarkedIds);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Profile */}
            <section id="profile">
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                      <AvatarFallback className="bg-primary/20 text-2xl text-primary">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">Welcome back</h2>
                      <p className="text-muted-foreground">
                        Continue your journey. Here’s what’s recommended for you.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Edit profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Recommended internships */}
            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Recommended for you</h3>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/internships">View all</Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_REC_INTERNSHIPS.map((internship, i) => (
                  <InternshipCard
                    key={internship.id}
                    internship={internship}
                    isBookmarked={isBookmarked(internship.id)}
                    onBookmark={() => toggleBookmark(internship.id)}
                    index={i}
                  />
                ))}
              </div>
            </section>

            {/* Recommended courses */}
            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Recommended courses</h3>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/learning">View all</Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_REC_COURSES.map((course, i) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={i}
                    onEnroll={() => {}}
                    isEnrolled={isEnrolled(course.id)}
                  />
                ))}
              </div>
            </section>

            {/* Saved internships */}
            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Saved internships</h3>
                </div>
              </div>
              {savedInternshipIds.length > 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  You have {savedInternshipIds.length} saved internship
                  {savedInternshipIds.length === 1 ? "" : "s"}. Open{" "}
                  <Link href="/internships" className="text-primary hover:underline">
                    Internships
                  </Link>{" "}
                  to search and manage bookmarks.
                </p>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 py-8 text-center">
                  <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No saved internships yet. Bookmark from the Internships page.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/internships">Find internships</Link>
                  </Button>
                </div>
              )}
            </section>

            {/* Saved courses */}
            {savedCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Saved courses</h3>
                </div>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedCourses.map((course, i) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={i}
                      onEnroll={() => {}}
                      isEnrolled={isEnrolled(course.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Enrolled courses */}
            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Enrolled courses</h3>
                </div>
              </div>
              {enrolledCourses.length > 0 ? (
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map((course, i) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={i}
                      onEnroll={() => {}}
                      isEnrolled={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 py-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No enrolled courses yet. Enroll from the Learning Portal.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/learning">Browse courses</Link>
                  </Button>
                </div>
              )}
            </section>
          </motion.div>
        </div>
      </div>

      {/* AI sidebar toggle (floating) */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg lg:bottom-8 lg:right-8"
        onClick={() => setAiOpen((o) => !o)}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Toggle AI assistant</span>
      </Button>

      <AISidebar open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

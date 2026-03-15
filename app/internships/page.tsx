"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagsInput } from "@/components/tags-input";
import { InternshipCard } from "@/components/internship-card";
import { InternshipEmpty } from "@/components/internship-empty";
import { InternshipSkeletons } from "@/components/internship-skeletons";
import { useInternshipsApi } from "@/hooks/use-internships-api";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { FindInternshipsRequest, Internship } from "@/types";

/** Social category for FastAPI (eligibility scoring). */
const SOCIAL_CATEGORIES = ["GEN", "SC", "ST", "OBC"] as const;

function normalizeInternship(raw: Record<string, unknown>): Internship {
  return {
    id: String(raw.id ?? raw.slug ?? Math.random().toString(36).slice(2)),
    company_name: String(raw.company_name ?? raw.company ?? ""),
    role: String(raw.role ?? raw.title ?? ""),
    location: String(raw.location ?? raw.city ?? ""),
    stipend: String(raw.stipend ?? raw.salary ?? "Not disclosed"),
    duration: String(raw.duration ?? ""),
    skills_required: Array.isArray(raw.skills_required)
      ? raw.skills_required.map(String)
      : Array.isArray(raw.skills)
        ? raw.skills.map(String)
        : [],
    eligibility_score:
      typeof raw.eligibility_score === "number"
        ? raw.eligibility_score
        : typeof raw.score === "number"
          ? raw.score
          : undefined,
    is_eligible:
      typeof raw.is_eligible === "boolean"
        ? raw.is_eligible
        : undefined,
    ...raw,
  };
}

export default function InternshipsPage() {
  const { internships, advice, loading, error, findInternships } = useInternshipsApi();
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [qualification, setQualification] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [category, setCategory] = useState("GEN");
  const [rural, setRural] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setHasSearched(true);
      findInternships({
        city,
        query,
        user: {
          qualification,
          skills,
          rural,
          category: category || "GEN",
        },
      });
    },
    [city, query, qualification, skills, rural, category, findInternships]
  );

  const list: Internship[] = Array.isArray(internships)
    ? internships.map((i) => (typeof i === "object" && i !== null ? normalizeInternship(i as Record<string, unknown>) : normalizeInternship({ id: String(i) })))
    : [];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-[360px_1fr]"
        >
          {/* Left: Form */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Search internships</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll match you with the best fits.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g. Bangalore, Remote"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="query">Role / query</Label>
                  <Input
                    id="query"
                    placeholder="e.g. Frontend, Data Analyst"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    placeholder="e.g. B.Tech, BCA"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Skills</Label>
                  <TagsInput
                    value={skills}
                    onChange={setSkills}
                    placeholder="Add skills..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Social category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="GEN" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rural"
                    checked={rural}
                    onCheckedChange={(v) => setRural(!!v)}
                  />
                  <Label htmlFor="rural" className="cursor-pointer text-sm font-normal">
                    Rural / tier-2 preference
                  </Label>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search internships
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </aside>

          {/* Right: Results + AI advice */}
          <div className="min-w-0 space-y-6">
            {hasSearched && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-primary/30 bg-primary/5 p-4 dark:bg-primary/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Recommended for you</p>
                      <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                        {loading
                          ? "Finding the best matches..."
                          : error
                            ? "We couldn't fetch results. Check your connection or try again."
                            : advice ?? (list.length > 0
                              ? `Based on your profile we found ${list.length} internship${list.length === 1 ? "" : "s"} that fit you. Focus on the ones marked Eligible for higher success.`
                              : "Try adjusting your city, skills, or category to see more results.")}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-destructive">{error}</p>
                    <p className="text-muted-foreground">
                      Checklist: 1) Docker running (DB + Qdrant). 2) FastAPI running on port 8000 (e.g. <code className="rounded bg-muted px-1">uvicorn main:app --reload --port 8000</code>). 3) City matches data in your DB (e.g. Bangalore).
                    </p>
                  </motion.div>
                )}

                {loading && <InternshipSkeletons />}

                {!loading && list.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((internship, i) => (
                      <InternshipCard
                        key={internship.id}
                        internship={internship}
                        isBookmarked={isBookmarked(internship.id)}
                        onBookmark={() => toggleBookmark(internship.id)}
                        index={i}
                      />
                    ))}
                  </div>
                )}

                {!loading && hasSearched && list.length === 0 && !error && (
                  <InternshipEmpty />
                )}
              </>
            )}

            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-24 text-center"
              >
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Ready to find internships?</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Fill in the filters on the left and click Search to get AI-powered
                  recommendations tailored to you.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

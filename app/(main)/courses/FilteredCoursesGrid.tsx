"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code,
  Database,
  Server,
  Terminal,
  Network,
  Cpu,
  FileText,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

// Map string icons to Lucide components
const iconMap: Record<string, any> = {
  Database,
  Server,
  Code,
  Terminal,
  Network,
  Cpu,
  BookOpen,
  FileText,
};

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

interface CourseCardProps {
  course: any;
}

function CourseCard({ course }: CourseCardProps) {
  const Icon = course.icon && iconMap[course.icon] ? iconMap[course.icon] : BookOpen;
  const accentColor = course.color || "#E2C6B9";

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <div
        className="relative h-full flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
        style={{
          boxShadow: "0 0 0 0 transparent",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px -10px ${accentColor}22`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 0 transparent";
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ backgroundColor: accentColor }}
        />

        {/* Cover image or gradient placeholder */}
        <div className="relative w-full h-44 shrink-0 overflow-hidden">
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${accentColor}18 0%, #0d0d0d 100%)`,
              }}
            >
              {/* Decorative grid */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon
                  className="w-16 h-16 opacity-10"
                  style={{ color: accentColor }}
                />
              </div>
            </div>
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />

          {/* Level badge */}
          {course.level && course.level !== "All Levels" && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
                color: accentColor,
              }}
            >
              {course.level}
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-6">
          {/* Icon + Name */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border group-hover:scale-110 transition-transform duration-300"
              style={{
                backgroundColor: `${accentColor}10`,
                borderColor: `${accentColor}25`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <h3 className="text-lg font-bold text-white leading-tight font-display group-hover:text-white transition-colors pt-1">
              {course.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-500 leading-relaxed mb-auto line-clamp-2">
            {course.description || "Explore comprehensive notes and chapters for this subject."}
          </p>

          {/* Alignment tags */}
          {course.alignments && course.alignments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {course.alignments.slice(0, 2).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-white/5 border border-white/10 text-zinc-400 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="my-4 border-t border-white/5" />

          {/* Footer stats + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {course.chapterCount} {course.chapterCount === 1 ? "Chapter" : "Chapters"}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {course.noteCount} Notes
              </span>
            </div>
            <div
              className="flex items-center gap-1 text-xs font-bold transition-all group-hover:gap-2"
              style={{ color: accentColor }}
            >
              Explore
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface FilteredCoursesGridProps {
  courses: any[];
  hideFilters?: boolean;
  limit?: number;
}

export function FilteredCoursesGrid({ courses, hideFilters = false, limit }: FilteredCoursesGridProps) {
  const [activeLevel, setActiveLevel] = useState<Level>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = courses.filter((c) => {
      const matchesLevel =
        activeLevel === "All" ||
        c.level === activeLevel ||
        c.level === "All Levels" ||
        !c.level;
      const matchesSearch =
        searchQuery === "" ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }
    return result;
  }, [courses, activeLevel, searchQuery, limit]);

  return (
    <div>
      {/* Filter + Search bar */}
      {!hideFilters && (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-full">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={
                activeLevel === level
                  ? {
                      backgroundColor: "#E2C6B9",
                      color: "#000",
                    }
                  : { color: "#71717a" }
              }
            >
              {level}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Results count */}
        <p className="text-xs text-zinc-600 font-mono ml-auto shrink-0">
          {filtered.length} {filtered.length === 1 ? "subject" : "subjects"} found
        </p>
      </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course: any) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4">
          <SlidersHorizontal className="w-10 h-10 text-zinc-700" />
          <p className="text-zinc-500 text-sm">
            No subjects match your filters.{" "}
            <button
              onClick={() => { setActiveLevel("All"); setSearchQuery(""); }}
              className="text-accent hover:underline"
            >
              Clear filters
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

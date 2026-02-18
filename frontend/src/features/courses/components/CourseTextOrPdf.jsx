import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { FolderOpen, Clock, SquareCheckBig, ChevronRight } from "lucide-react";

export default function CourseTextOrPdf({ course, category }) {
  if (!course) return null;
  // Split content into paragraphs and subheadings for Figma-like rendering
  const lines = (course.content || "").split(/\n+/);
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-xl pt-xl pb-0">
        <PageHeader
          title={course.title}
          breadcrumbs={[
            { label: "Courses", href: "/courses" },
            {
              label: category
                ? category
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                : "",
              href: `/courses/${category}`,
            },
            { label: course.title },
          ]}
          showBreadcrumbSeparator
          containerClassName="!pt-0 !pb-0 !px-0"
        />
        {/* Action Buttons */}
        {/* <div className="flex gap-4 mt-4 lg:mt-0 max-w-96"> */}
        <div className="flex gap-4 mt-4 lg:mt-0 ">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#9C2EDB] text-[#9C2EDB] text-sm font-semibold hover:bg-gray-50 transition cursor-pointer">
            Mark as read
            <SquareCheckBig className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#9C2EDB] text-white text-sm font-semibold hover:opacity-90 transition cursor-pointer">
            Next Lecture
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 mb-2 px-xl mt-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderOpen className="w-5 h-5" color="#9C2EDB" />
          <span className="text-sm">
            {category
              ? category
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" color="#9C2EDB" />
          <span className="text-sm">Duration</span>
        </div>
      </div>
      <div className=" mx-auto px-xl py-8">
        <div className="space-y-6">
          {lines.map((line, idx) => {
            return (
              <div key={idx} className="text-lg text-gray-700 leading-relaxed">
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

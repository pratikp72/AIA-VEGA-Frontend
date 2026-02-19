import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { FolderOpen, Clock, SquareCheckBig, ChevronRight, ArrowLeft } from "lucide-react";
import { COLORS } from "@/lib/constants";

export default function CourseTextOrPdf({ course, category, selectedModule, onBack }) {
  if (!course) return null;
  
  const contentToDisplay = selectedModule?.content || course.content || "";
  const lines = contentToDisplay.split(/\n+/);
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-xl pt-xl pb-0">
        <div className="flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 mb-4 transition"
              style={{ color: COLORS.PRIMARY }}
              onMouseEnter={(e) => e.currentTarget.style.color = COLORS.PRIMARY_DARK}
              onMouseLeave={(e) => e.currentTarget.style.color = COLORS.PRIMARY}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Preview</span>
            </button>
          )}
          <PageHeader
            title={selectedModule?.moduleTitle || course.title}
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
              ...(selectedModule ? [{ label: selectedModule.moduleTitle }] : []),
            ]}
            showBreadcrumbSeparator
            containerClassName="!pt-0 !pb-0 !px-0"
          />
        </div>
        {/* Action Buttons */}
        <div className="flex gap-4 mt-4 lg:mt-0">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border text-sm font-semibold hover:bg-gray-50 transition cursor-pointer" style={{ borderColor: COLORS.PRIMARY, color: COLORS.PRIMARY }}>
            Mark as read
            <SquareCheckBig className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition cursor-pointer" style={{ backgroundColor: COLORS.PRIMARY }}>
            Next Lecture
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 mb-2 px-xl mt-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderOpen className="w-5 h-5" color={COLORS.PRIMARY} />
          <span className="text-sm">
            6 sections
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" color={COLORS.PRIMARY} />
          <span className="text-sm">{selectedModule?.moduleDuration || "Duration"}</span>
        </div>
      </div>
      <div className="mx-auto px-xl py-8">
        <div className="space-y-6">
          {lines.length > 0 ? (
            lines.map((line, idx) => {
              if (!line.trim()) return null;
              return (
                <div key={idx} className="text-lg text-gray-700 leading-relaxed">
                  {line}
                </div>
              );
            })
          ) : (
            <div className="text-lg text-gray-700 leading-relaxed">
              <p>No content available for this reading module.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

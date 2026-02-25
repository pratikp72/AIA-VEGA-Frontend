import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { FolderOpen, Clock, SquareCheckBig, ChevronRight, ArrowLeft } from "lucide-react";

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
              className="flex items-center gap-2 mb-4 text-primary hover:text-primary/80 transition"
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
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-primary text-primary text-sm font-semibold hover:bg-gray-50 transition cursor-pointer">
            Mark as read
            <SquareCheckBig className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition cursor-pointer">
            Next Lecture
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 mb-2 px-xl mt-4">
        <div className="flex items-center gap-2 text-gray-700">
          <FolderOpen className="w-5 h-5 text-primary" />
          <span className="text-sm">
            6 sections
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-sm">{selectedModule?.moduleDuration || "Duration"}</span>
        </div>
      </div>

      
      <div className="mx-auto px-xl py-8">
        
        <div className="space-y-6">
             <div className="text-lg text-gray-700 leading-relaxed">
             {contentToDisplay || "No content available for this reading module."}
             </div>
        </div>
      </div>
    </div>
  );
}

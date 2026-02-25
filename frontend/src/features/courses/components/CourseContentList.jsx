import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  PlayCircle,
  CheckCircle2,
  MonitorPlay,
  ChevronUp,
  ChevronDown,
  SquareCheckBig,
  ChevronRight,
  Lock,
} from "lucide-react";

function ModuleCircle({ moduleNumber, moduleStatus, isSelected }) {
  if (isSelected) {
    return (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 bg-primary/20 text-primary">
        {moduleNumber}
      </span>
    );
  }

  if (moduleStatus === "completed") {
    return (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 bg-success">
        <CheckCircle2 className="w-5 h-5 text-white" />
      </span>
    );
  }

  if (moduleStatus === "locked") {
    return (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 bg-gray-200">
        <Lock className="w-5 h-5 text-gray-500" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 bg-white border-2 border-primary text-primary">
      {moduleNumber}
    </span>
  );
}

export default function CourseContentList({ current, onSelect, courseId, category, course }) {
  // Debug: log modules array
  console.log('CourseContentList course:', course);
  // Prefer modulesList if present and is array, else fallback to modules
  const modules = Array.isArray(course?.modulesList)
    ? course.modulesList
    : (Array.isArray(course?.modules) ? course.modules : []);
  console.log('CourseContentList modules:', modules);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentModuleId = searchParams.get('moduleId');

  const defaultModuleId = modules?.[0]?.id;
  const activeModuleId = currentModuleId ? parseInt(currentModuleId) : (typeof current === 'number' ? current : defaultModuleId);
  const [openModuleId, setOpenModuleId] = useState(activeModuleId || defaultModuleId);

  useEffect(() => {
    if (activeModuleId) {
      setOpenModuleId(activeModuleId);
    } else if (defaultModuleId && !currentModuleId && course?.documentId) {
      const url = `/courses/${category}/${course.documentId}`;
      router.replace(url);
    }
    // router is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleId, defaultModuleId, category, courseId, params.id, currentModuleId, course]);

  if (!modules.length) return <div className="text-gray-500 italic">No modules found for this course.</div>;

  const handleModuleClick = (module) => {
    if (!course?.documentId) return;
    const url = `/courses/${category}/${course.documentId}/${module.id}`;
    router.push(url);
  };

  return (
    <div>
      <h3 className="mt-10 mb-6 text-2xl font-bold text-gray-900">
        Course Contents
      </h3>
      <div className="flex flex-col gap-3">
        {modules.map((module, idx) => {
          const isOpen = openModuleId === module.id;
          const isSelected = activeModuleId === module.id;
          let displayStatus = module.mark_as_read ? "completed" : "active";
          return (
            <div
              key={module.id}
              className="bg-white rounded-2xl shadow overflow-hidden"
            >
              {/* Module Header */}
              <button
                onClick={() => handleModuleClick(module)}
                className={`flex items-center gap-3 w-full text-left p-4 cursor-pointer`}
              >
                <ModuleCircle
                  moduleNumber={idx + 1}
                  moduleStatus={displayStatus}
                  isSelected={isSelected}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-gray-900 truncate font-semibold">
                    {module.moduleTitle || 'Untitled Module'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {module.moduleType || 'Unknown'}
                    {typeof module.moduleDuration === 'number' && module.moduleDuration > 0
                      ? ` • ${module.moduleDuration} min`
                      : ''}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {isOpen && (
                <>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 rounded-b-2xl px-4 pb-4">
                    <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-primary text-primary h-10 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer">
                      Mark as read
                      <SquareCheckBig className="w-4 h-4" />
                    </button>
                    <button className="flex-1 flex items-center justify-center h-10 gap-2 p-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition cursor-pointer">
                      Next Lecture
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

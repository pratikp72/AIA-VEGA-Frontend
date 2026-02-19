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
import { COLORS } from "@/lib/constants";

function ModuleCircle({ moduleNumber, moduleStatus, isSelected }) {
  if (isSelected) {
    return (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0" style={{ backgroundColor: COLORS.PRIMARY_OPACITY_20, color: COLORS.PRIMARY }}>
        {moduleNumber}
      </span>
    );
  }

  if (moduleStatus === "completed") {
    return (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0" style={{ backgroundColor: COLORS.SUCCESS }}>
        <CheckCircle2 className="w-5 h-5 text-white" />
      </span>
    );
  }

  if (moduleStatus === "locked") {
    return (
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0" style={{ backgroundColor: COLORS.LOCKED_BG }}>
        <Lock className="w-5 h-5" style={{ color: COLORS.GRAY_500 }} />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 bg-white border-2" style={{ borderColor: COLORS.PRIMARY, color: COLORS.PRIMARY }}>
      {moduleNumber}
    </span>
  );
}

export default function CourseContentList({ contents, current, onSelect, courseId, category }) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentModuleId = searchParams.get('moduleId');
  
  const defaultModuleId = contents?.[0]?.id;
  const activeModuleId = currentModuleId ? parseInt(currentModuleId) : (typeof current === 'number' ? current : defaultModuleId);
  const [openModuleId, setOpenModuleId] = useState(activeModuleId || defaultModuleId);

  useEffect(() => {
    if (activeModuleId) {
      setOpenModuleId(activeModuleId);
    } else if (defaultModuleId && !currentModuleId) {
      const url = `/courses/${category}/${courseId || params.id}?moduleId=${defaultModuleId}`;
      router.replace(url);
    }
    // router is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleId, defaultModuleId, category, courseId, params.id, currentModuleId]);

  if (!contents || !contents.length) return null;

  const handleModuleClick = (module) => {
    const url = `/courses/${category}/${courseId || params.id}?moduleId=${module.id}`;
    router.push(url);
  };

  return (
    <div>
      <h3 className="mt-10 mb-6 text-2xl font-bold text-gray-900">
        Course Contents
      </h3>
      <div className="flex flex-col gap-3">
        {contents.map((module) => {
          const isOpen = openModuleId === module.id;
          const isSelected = activeModuleId === module.id;
          
          let displayStatus = module.moduleStatus;
          
          if (displayStatus === "active" && !isSelected) {
            displayStatus = "pending";
          }

          return (
            <div
              key={module.id}
              className="bg-white rounded-2xl shadow overflow-hidden"
            >
              {/* Module Header */}
              <button
                onClick={() => handleModuleClick(module)}
                disabled={module.moduleStatus === "locked"}
                className={`flex items-center gap-3 w-full text-left p-4 ${
                  module.moduleStatus === "locked" ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                <ModuleCircle
                  moduleNumber={module.moduleNumber}
                  moduleStatus={displayStatus}
                  isSelected={isSelected}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-gray-900 truncate">
                    {module.moduleTitle}
                  </span>
                  <span className="text-xs text-gray-400">
                    {module.moduleType} &bull; {module.moduleDuration}
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
                    <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border h-10 text-sm font-semibold hover:bg-gray-50 transition cursor-pointer" style={{ borderColor: COLORS.PRIMARY, color: COLORS.PRIMARY }}>
                      Mark as read
                      <SquareCheckBig className="w-4 h-4" />
                    </button>
                    <button className="flex-1 flex items-center justify-center h-10 gap-2 p-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition cursor-pointer" style={{ backgroundColor: COLORS.PRIMARY }}>
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

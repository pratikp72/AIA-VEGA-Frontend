import React, { useState } from "react";
import {
  PlayCircle,
  CheckCircle2,
  MonitorPlay,
  BookOpen,
  FileText,
  ChevronUp,
  ChevronDown,
  SquareCheckBig,
  ChevronRight,
} from "lucide-react";

function ContentIcon({ type, status }) {
  if (status === "completed") {
    return <CheckCircle2 className="w-5 h-5 text-[#46BD84]" />;
  }
  if (status === "active") {
    return <PlayCircle className="w-5 h-5 text-[#9C2EDB]" />;
  }
  if (type === "quiz") {
    return <MonitorPlay className="w-5 h-5 text-gray-400" />;
  }
  return <PlayCircle className="w-5 h-5 text-gray-400" />;
}

function ModuleCircle({ moduleNumber, moduleStatus }) {
  const styles = {
    active: "bg-[#9C2EDB] text-white",
    completed: "bg-white border-2 border-[#46BD84] text-[#46BD84]",
    pending: "bg-white border-2 border-[#9C2EDB] text-[#9C2EDB]",
    locked: "bg-white border-2 border-gray-300 text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 ${styles[moduleStatus] || styles.pending}`}
    >
      {moduleNumber}
    </span>
  );
}

export default function CourseContentList({ contents, current, onSelect }) {
  const [openModuleId, setOpenModuleId] = useState(contents?.[0]?.id ?? null);

  if (!contents || !contents.length) return null;

  return (
    <div>
      <h3 className="mt-10 mb-6 text-2xl font-bold text-gray-900">
        Course Contents
      </h3>
      <div className="flex flex-col gap-3">
        {contents.map((module) => {
          const isOpen = openModuleId === module.id;

          return (
            <div
              key={module.id}
              className="bg-white rounded-2xl shadow overflow-hidden"
            >
              {/* Module Header */}
              <button
                onClick={() => setOpenModuleId(isOpen ? null : module.id)}
                className="flex items-center gap-3 w-full text-left px-5 py-4 cursor-pointer"
              >
                <ModuleCircle
                  moduleNumber={module.moduleNumber}
                  moduleStatus={module.moduleStatus}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 truncate">
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
                  <ul className="flex flex-col gap-1 px-5 pb-2">
                    {module.items.map((item) => {
                      const isActive = item.status === "active";
                      return (
                        <li
                          key={item.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${
                            isActive ? "bg-[#9C2EDB0D]" : "hover:bg-gray-50"
                          }`}
                          onClick={() => onSelect && onSelect(item.id)}
                        >
                          <ContentIcon type={item.type} status={item.status} />
                          <span
                            className={`flex-1 text-sm ${
                              isActive
                                ? "font-semibold text-[#9C2EDB]"
                                : "text-gray-700"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.time}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 border-t border-t-[#E6E6E6] bg-[#F3ECFB] rounded-b-2xl p-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#9C2EDB] text-[#9C2EDB] text-sm font-semibold hover:bg-gray-50 transition cursor-pointer">
                      Mark as read
                      <SquareCheckBig className="w-4 h-4" />
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#9C2EDB] text-white text-sm font-semibold hover:opacity-90 transition cursor-pointer">
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

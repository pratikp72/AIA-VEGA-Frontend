import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FolderOpen, Clock, Maximize2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageSection from "@/components/common/PageSection";
import CourseStats from "./CourseStats";
import CourseContentList from "./CourseContentList";
import FinalAssessment from "./FinalAssessment";
import CourseTextOrPdf from "./CourseTextOrPdf";
import { useAppDispatch } from "@/store/hooks";
import { markModuleAsRead } from "@/features/courses/coursesSlice";
import { updateModuleMarkAsRead } from "@/features/courses/coursesAPI";

export default function CoursesDetailPage({ category, course, selectedModule }) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [showFullReadingView, setShowFullReadingView] = useState(false);
  const [canMarkAsRead, setCanMarkAsRead] = useState(false);

  if (!course) return <div className="p-8">Course not found.</div>;



  // Use normalized modulesList (normalizeModule maps modules → modulesList)
  const contents = Array.isArray(course.modulesList) ? course.modulesList : [];
  const quizzes = course.quiz || [];
  const feedbacks = course.feedback || [];
  const description = course.description || [];
  const unlocked = true; // Adjust if you have a real field for this
  // For debugging:
  // console.log('modules:', contents)

  const moduleId = searchParams.get('moduleId');
  const currentModule = selectedModule || (moduleId ? contents.find(m => String(m.id) === String(moduleId)) : contents[0]) || contents[0];

  // Reset canMarkAsRead and start a 50%-duration timer whenever the module changes.
  // If the module has no duration, enable immediately.
  useEffect(() => {
    setCanMarkAsRead(false);
    const durationMin = currentModule?.moduleDuration;
    if (!durationMin || durationMin <= 0) {
      setCanMarkAsRead(true);
      return;
    }
    const thresholdMs = durationMin * 60 * 1000 * 0.5; // 50% of duration in ms
    const timer = setTimeout(() => setCanMarkAsRead(true), thresholdMs);
    return () => clearTimeout(timer);
  }, [currentModule?.id]); // re-run only when module changes

  const handleMarkAsRead = async (moduleId) => {
    dispatch(markModuleAsRead({ moduleId })); // instant UI update
    try {
      await updateModuleMarkAsRead(course.documentId, moduleId, course.rawModules); // persist to Strapi
    } catch (err) {
      console.error('Failed to mark module as read:', err);
    }
  };

  if (showFullReadingView) {
    return <CourseTextOrPdf course={course} category={category} selectedModule={currentModule} onBack={() => setShowFullReadingView(false)} />;
  }

  const courseBgStyle = {
    backgroundImage: 'url(/course-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={courseBgStyle}>
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
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      />
      <main>
        <PageSection>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10">
            {/* Left Column: Video + Content */}
            <div className="lg:col-span-2">
              {/* Icons row above video */}
              <div className="flex items-center gap-6 mb-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm">
                      {contents.length} {contents.length === 1 ? "section" : "sections"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm">{currentModule?.moduleDuration || "Duration"} mins</span>
                </div>
              </div>

              {currentModule && (
                <h2 className="text-lg font-semibold text-gray-900 mt-10">
                  {currentModule.moduleTitle || currentModule.title}
                </h2>
              )}

              {/* Show content based on moduleType */}
              {currentModule?.moduleType === 'Video' ? (
                <div className="relative max-h-[467px] overflow-hidden rounded-xl mt-2">
                  <video
                    controls
                    className="w-full h-full object-cover rounded-xl"
                  >
                    <source
                      src={currentModule.video_file?.url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : currentModule?.moduleType === 'Text' ? (
                <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
                  {/* Reading Content Preview Container */}
                  <div className="p-4 space-y-5 max-h-[467px] overflow-y-auto">
                    {currentModule.content ? (
                      <div className="space-y-4">
                        {currentModule.content.split(/\n+/).slice(0, 5).map((line, idx) => (
                          line.trim() && (
                            <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                              {line}
                            </p>
                          )
                        ))}
                        {currentModule.content.split(/\n+/).length > 5 && (
                          <p className="text-sm text-gray-500 italic">
                            ... (content truncated, click "View Full Content" to read more)
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No content available.</div>
                    )}
                  </div>
                  {/* View Full Content Button */}
                  <div className="p-4">
                    <button
                      onClick={() => setShowFullReadingView(true)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                      View Full Content
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 mt-10 space-y-5">
                  {currentModule && currentModule.content ? (
                    <>
                      <div className="relative">
                        <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line max-h-80 overflow-hidden pr-2" style={{ WebkitMaskImage: 'linear-gradient(180deg, #000 80%, transparent 100%)' }}>
                          {currentModule.content}
                        </div>
                        <div className="p-4">
                          <button
                            onClick={() => setShowFullReadingView(true)}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition cursor-pointer"
                          >
                            <Maximize2 className="w-4 h-4" />
                            View Full Content
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 italic">No preview available for this module type.</div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Stats + Course Contents */}
            <div className="lg:col-span-1 mt-18">
              <CourseStats course={course} />
              <CourseContentList
                contents={contents}
                current={currentModule?.id || 0}
                courseId={course.documentId}
                category={category}
                course={course}
                canMarkAsRead={canMarkAsRead}
                onMarkAsRead={handleMarkAsRead}
              />
              <FinalAssessment unlocked={unlocked} category={category} courseId={course.documentId} />
            </div>
          </div>
        </PageSection>
      </main>
    </div>
  );
}

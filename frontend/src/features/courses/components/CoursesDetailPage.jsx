import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FolderOpen, Clock, Maximize2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageSection from "@/components/common/PageSection";
import CourseStats from "./CourseStats";
import CourseContentList from "./CourseContentList";
import FinalAssessment from "./FinalAssessment";
import CourseTextOrPdf from "./CourseTextOrPdf";


export default function CoursesDetailPage({ category, course, selectedModule }) {
  // Debug: log course object
  console.log('CoursesDetailPage course:', course);
  const searchParams = useSearchParams();
  const [showFullReadingView, setShowFullReadingView] = useState(false);

  if (!course) return <div className="p-8">Course not found.</div>;



  // Use raw Strapi modules array directly
  const contents = Array.isArray(course.modules) ? course.modules : [];
  const quizzes = course.quiz || [];
  const feedbacks = course.feedback || [];
  const description = course.description || [];
  const unlocked = true; // Adjust if you have a real field for this
  // For debugging:
  // console.log('modules:', contents)

  const moduleId = searchParams.get('moduleId');
  const currentModule = selectedModule || (moduleId ? contents.find(m => String(m.id) === String(moduleId)) : contents[0]) || contents[0];

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
                    6 sections
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm">{currentModule?.moduleDuration || "Duration"}</span>
                </div>
              </div>

              {currentModule && (
                <h2 className="text-lg font-semibold text-gray-900 mt-10">
                  {currentModule.title}
                </h2>
              )}

              {/* Show content based on moduleType */}
              {currentModule?.module_content_type === 'Video' ? (
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
              ) : currentModule?.module_content_type === 'Text' ? (
                <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
                  {/* Reading Content Preview Container */}
                  <div className="p-4 space-y-5 max-h-[467px] overflow-y-auto">
                    {currentModule.text_content ? (
                      <div className="space-y-4">
                        {currentModule.text_content.split(/\n+/).slice(0, 5).map((line, idx) => (
                          line.trim() && (
                            <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                              {line}
                            </p>
                          )
                        ))}
                        {currentModule.text_content.split(/\n+/).length > 5 && (
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
              <CourseContentList contents={contents} current={currentModule?.id || 0} courseId={course.id} category={category} course={course} />
              <FinalAssessment unlocked={unlocked} category={category} courseId={course.id} />
            </div>
          </div>
        </PageSection>
      </main>
    </div>
  );
}

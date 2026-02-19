import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FolderOpen, Clock, Maximize2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageSection from "@/components/common/PageSection";
import CourseStats from "./CourseStats";
import CourseContentList from "./CourseContentList";
import FinalAssessment from "./FinalAssessment";
import CourseTextOrPdf from "./CourseTextOrPdf";
import { MOCK_COURSE_CONTENTS, MOCK_COURSE_INSTRUCTIONS } from "@/services/mockData";
import { COLORS } from "@/lib/constants";

export default function CoursesDetailPage({ category, course, selectedModule }) {
  const searchParams = useSearchParams();
  const [showFullReadingView, setShowFullReadingView] = useState(false);
  
  if (!course) return <div className="p-8">Course not found.</div>;

  const contents = MOCK_COURSE_CONTENTS;
  const instructions = MOCK_COURSE_INSTRUCTIONS;

  const moduleId = searchParams.get('moduleId');
  const currentModule = selectedModule || (moduleId ? contents.find(m => String(m.id) === String(moduleId)) : contents[0]) || contents[0];

  const unlocked = course.completed;

  if (currentModule?.moduleType === 'Reading' && showFullReadingView) {
    return <CourseTextOrPdf course={course} category={category} selectedModule={currentModule} onBack={() => setShowFullReadingView(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
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
        containerClassName="pt-xl pb-0 px-xl"
      />
      <main>
        <PageSection>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10">
            {/* Left Column: Video + Content */}
            <div className="lg:col-span-2">
              {/* Icons row above video */}
              <div className="flex items-center gap-6 mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderOpen className="w-5 h-5" color={COLORS.PRIMARY} />
                  <span className="text-sm">
                    6 sections
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" color={COLORS.PRIMARY} />
                  <span className="text-sm">{currentModule?.moduleDuration || "Duration"}</span>
                </div>
              </div>

              {currentModule && (
                <h2 className="text-lg font-semibold text-gray-900 mt-10">
                  {currentModule.moduleNumber}. {currentModule.moduleTitle}
                </h2>
              )}

              {/* Show content based on moduleType */}
              {currentModule?.moduleType === 'Video' ? (
                <div className="relative max-h-[467px] overflow-hidden rounded-xl mt-2">
                  <video
                    controls
                    poster={course.image}
                    className="w-full h-full object-cover rounded-xl"
                  >
                    <source
                      src="https://www.w3schools.com/html/mov_bbb.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : currentModule?.moduleType === 'Reading' ? (
                <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
                  {/* Reading Content Preview Container */}
                  <div className="p-4 space-y-5 max-h-[467px] overflow-y-auto">
                    {(currentModule.content || course.content) ? (
                      <div className="space-y-4">
                        {((currentModule.content || course.content).split(/\n+/).slice(0, 5)).map((line, idx) => (
                          line.trim() && (
                            <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                              {line}
                            </p>
                          )
                        ))}
                        {(currentModule.content || course.content).split(/\n+/).length > 5 && (
                          <p className="text-sm text-gray-500 italic">
                            ... (content truncated, click "View Full Content" to read more)
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {instructions.slice(0, 3).map((block, idx) => {
                          if (block.type === "heading") {
                            return (
                              <h3 key={idx} className="text-lg font-bold text-gray-900 uppercase">
                                {block.content}
                              </h3>
                            );
                          }
                          if (block.type === "list") {
                            return (
                              <ul key={idx} className="list-disc pl-6 space-y-1">
                                {block.items.slice(0, 3).map((item, i) => (
                                  <li key={i} className="text-sm text-gray-700 leading-relaxed">{item}</li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                              {block.content}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* View Full Content Button */}
                  <div className="p-4">
                    <button
                      onClick={() => setShowFullReadingView(true)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition cursor-pointer"
                      style={{ backgroundColor: COLORS.PRIMARY }}
                    >
                      <Maximize2 className="w-4 h-4" />
                      View Full Content
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 mt-10 space-y-5">
                  {instructions.map((block, idx) => {
                    if (block.type === "heading") {
                      return (
                        <h3 key={idx} className="text-lg font-bold text-gray-900 uppercase">
                          {block.content}
                        </h3>
                      );
                    }
                    if (block.type === "list") {
                      return (
                        <ul key={idx} className="list-disc pl-6 space-y-1">
                          {block.items.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                        {block.content}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Lectures content directly below video - Only show for Video modules */}
              {currentModule?.moduleType === 'Video' && (
                <div className="space-y-6 mt-6">
                  {/* <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentModule?.moduleNumber || 1}. {currentModule?.moduleTitle || 'Performance Optimization'}
                  </h2> */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="font-semibold text-lg text-gray-800 mb-2">
                      Lectures Description
                    </div>
                    <div className="text-gray-700 text-base leading-relaxed">
                      We cover everything you need to build your first website.
                      From creating your first page through to uploading your
                      website to the internet. We'll use the world's most popular
                      (and free) web design tool called Visual Studio Code. There
                      are exercises files you can download and work through along
                      with me. At the end of each video I have a downloadable
                      version of where we are in the process so that you can
                      compare your project with mine. This will enable you to see
                      easily where you might have a problem. We will delve into
                      all the good stuff such as how to create your very own
                      mobile burger menu for scratch learning some basic
                      JavaScript and jQuery. If that all sounds a little too fancy
                      - don't worry, this course is aimed at people new to web
                      design and who have never coded before. We'll start right at
                      the beginning and work our way through step by step.
                    </div>
                    <div className="font-semibold text-2xl text-gray-800 mb-2 mt-4">
                      Lecture Notes
                    </div>
                    <div className="text-gray-700 text-base leading-relaxed space-y-4">
                      <p>
                        In ut aliquam ante. Curabitur mollis tincidunt turpis, sed
                        aliquam mauris finibus vel. Praesent eget mi in mi maximus
                        egestas. Mauris eget ipsum in justo bibendum pellentesque.
                        Sed id arcu in arcu ullamcorper eleifend condimentum quis
                        diam. Phasellus tempus, urna ut auctor mattis, nisi nunc
                        tincidunt lorem, eu egestas augue lectus ut sapien.
                        Maecenas tristique aliquet massa, a venenatis augue tempor
                        in. Aliquam turpis urna, imperdiet in lacus a, posuere
                        suscipit augue.
                      </p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>
                          Nullam non quam a lectus finibus varius nec a orci.{" "}
                          <span className="font-semibold">
                            Aliquam efficitur enim cursus elit efficitur lacinia
                          </span>
                        </li>
                        <li>
                          Morbi sit amet pretium tellus.{" "}
                          <span className="font-semibold">
                            Donec blandit fermentum blandit
                          </span>
                        </li>
                        <li>
                          Proin iaculis sem et imperdiet tincidunt. Nam varius ac
                          nisl id sodales. Donec iaculis interdum mattis.
                        </li>
                        <li>Curabitur posuere ultricies diam et egestas.</li>
                        <li>
                          Donec id diam et lacus pharetra vestibulum a id est.
                          Mauris vestibulum massa quis elit feugiat, dictum
                          maximus ipsum pellentesque.
                        </li>
                      </ul>
                      <p>
                        Sed elementum, libero id lacinia aliquet, purus nibh
                        consectetur mauris, eget tincidunt nisi risus vitae sem.
                        Integer lobortis urna non laoreet posuere vehicula
                        condimentum. Quisque quis lacus quam. Quam orci bibendum
                        erat, nec non. Nam pharetra egestas varius. Sed
                        ullamcorper facilisis hendrerit.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Stats + Course Contents */}
            <div className="lg:col-span-1 mt-18">
              <CourseStats course={course} />
              <CourseContentList contents={contents} current={currentModule?.id || 0} courseId={course.id} category={category} />
              <FinalAssessment unlocked={unlocked} category={category} courseId={course.id} />
            </div>
          </div>
        </PageSection>
      </main>
    </div>
  );
}

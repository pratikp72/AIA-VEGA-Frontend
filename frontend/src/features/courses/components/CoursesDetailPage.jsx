import React from "react";
import { FolderOpen, Clock } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageSection from "@/components/common/PageSection";
import CourseStats from "./CourseStats";
import CourseContentList from "./CourseContentList";
import FinalAssessment from "./FinalAssessment";
import { MOCK_COURSE_MODULES, MOCK_COURSE_CONTENTS } from "@/services/mockData";

export default function CoursesDetailPage({ category, course }) {
  if (!course) return <div className="p-8">Course not found.</div>;

  // Use imported mock data
  const modules = MOCK_COURSE_MODULES;
  const contents = MOCK_COURSE_CONTENTS;

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

              {course.contentType === 'video' ? (
                <div className="relative h-[467px] overflow-hidden rounded-xl mt-10">
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
              ) : (
                <div className="bg-[#F8FAFC] border border-[#D1D5DB] rounded-xl p-4 mt-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </span>
                    <span className="font-semibold text-gray-800 text-base">{course.title}</span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.content}
                  </div>
                  </div>
                // </div>
              )}

              {/* Lectures content directly below video */}
              <div className="space-y-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Performance Optimization
                </h2>
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
            </div>

            {/* Right Column: Stats + Course Contents */}
            <div className="lg:col-span-1 mt-14">
              <CourseStats course={course} />
              <CourseContentList contents={contents} current={0} />

              <FinalAssessment />
            </div>
          </div>
        </PageSection>
      </main>
    </div>
  );
}

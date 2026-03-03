import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderOpen, Clock, Maximize2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import PageSection from "@/components/common/PageSection";
import CourseStats from "./CourseStats";
import CourseContentList from "./CourseContentList";
import FinalAssessment from "./FinalAssessment";
import CourseTextOrPdf from "./CourseTextOrPdf";
import FeedbackForm from "./FeedbackForm";
import LayoutShell from "@/components/layout/LayoutShell";
import PageContainer from "@/components/layout/PageContainer";
import { useAppDispatch } from "@/store/hooks";
import { markModuleAsRead, initializeModuleReadState } from "@/features/courses/coursesSlice";
import { markModuleProgress, fetchUserCourseProgress } from "@/features/courses/coursesAPI";
import { getLatestSubmission, checkPendingReattemptRequest } from "../quizSubmissionAPI";
import { getCurrentUserId } from "@/lib/auth";

export default function CoursesDetailPage({ category, course, selectedModule }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFullReadingView, setShowFullReadingView] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [courseProgress, setCourseProgress] = useState({ progressStatus: null, quizScore: null, hasPendingReattempt: false, needsFeedbackSubmission: false });
  const skipNextProgressUpdate = useRef(false);

  if (!course) return <div className="p-8">Course not found.</div>;



  // Use normalized modulesList (normalizeModule maps modules → modulesList)
  const contents = Array.isArray(course.modulesList) ? course.modulesList : [];
  const quizzes = course.quiz || [];
  const feedbacks = course.feedback || [];
  const description = course.description || [];
  const allModulesCompleted = contents.length > 0 && contents.every(m => m.mark_as_read);
  // For debugging:
  // console.log('modules:', contents)

  const moduleIdFromUrl = searchParams.get('moduleId');
  const currentModule = selectedModule || (moduleIdFromUrl ? contents.find(m => String(m.moduleId || m.id) === String(moduleIdFromUrl)) : contents[0]) || contents[0];
  const currentModuleIdx = contents.findIndex(m => String(m.moduleId || m.id) === String(currentModule?.moduleId || currentModule?.id));
  const nextModule = currentModuleIdx >= 0 ? contents[currentModuleIdx + 1] || null : null;

  // Fetch per-user read state from user-progress whenever the course loads.
  // This replaces the shared mark_as_read from the course schema.
  useEffect(() => {
    const userId = getCurrentUserId();
    const courseIdForApi = course?.id ?? course?.documentId;
    if (!courseIdForApi || !userId) return;
    Promise.all([
      fetchUserCourseProgress(userId, courseIdForApi, { fresh: true }),
      checkPendingReattemptRequest(userId, courseIdForApi),
    ]).then(([{ completedModules, progressStatus }, hasPending]) => {
      if (skipNextProgressUpdate.current) {
        skipNextProgressUpdate.current = false;
        setCourseProgress((p) => ({ ...p, progressStatus, hasPendingReattempt: hasPending }));
        return;
      }
      dispatch(initializeModuleReadState(completedModules));
      setCourseProgress((p) => ({ ...p, progressStatus, hasPendingReattempt: hasPending }));
      if (progressStatus === "Completed") {
        getLatestSubmission(userId, courseIdForApi).then((res) => {
          const score = res?.submission?.score;
          setCourseProgress((p) => ({ ...p, quizScore: score }));
        });
      } else if (progressStatus === "In_progress") {
        // Check if user passed quiz but hasn't submitted feedback (course not fully completed)
        getLatestSubmission(userId, courseIdForApi).then((res) => {
          const passed = res?.submission?.passed === true;
          setCourseProgress((p) => ({ ...p, needsFeedbackSubmission: passed }));
        });
      }
    });
  }, [course?.id, course?.documentId, dispatch]);


  const handleMarkAsRead = async (modId) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    dispatch(markModuleAsRead({ moduleId: modId })); // instant UI update
    try {
      await markModuleProgress({ userId, courseId: course.id ?? course.documentId, moduleId: String(modId) });
      // Refetch progress to ensure UI stays in sync with backend
      const courseIdForApi = course.id ?? course.documentId;
      if (courseIdForApi) {
        const { completedModules } = await fetchUserCourseProgress(userId, courseIdForApi, { fresh: true });
        skipNextProgressUpdate.current = true;
        dispatch(initializeModuleReadState(completedModules));
      }
    } catch (err) {
      console.error('Failed to mark module as read:', err);
      // Refetch to restore actual state (optimistic update may have shown incorrect state)
      const courseIdForApi = course.id ?? course.documentId;
      if (courseIdForApi) {
        fetchUserCourseProgress(userId, courseIdForApi, { fresh: true }).then(({ completedModules }) => {
          dispatch(initializeModuleReadState(completedModules));
        });
      }
    }
  };

  const handleNextLecture = () => {
    if (!nextModule || !course?.documentId) return;
    router.push(`/courses/${category}/${course.documentId}/${nextModule.id}`);
  };

  // Feedback form: when user passed quiz but hasn't submitted feedback
  if (showFeedbackForm) {
    const feedbackForLang =
      (course.feedback || []).find((fb) => fb.language === course.quiz?.[0]?.language) ||
      (course.feedback || [])[0];
    const feedbackQuestions = feedbackForLang?.feedback_question || [];
    const userId = getCurrentUserId();
    const courseNumericId = course.id ?? course.documentId;

    return (
      <LayoutShell>
        <PageContainer className="py-8">
          <FeedbackForm
            questions={feedbackQuestions}
            onCancel={() => setShowFeedbackForm(false)}
            onSubmit={(response) => {
              setShowFeedbackForm(false);
              // Refetch progress - backend finalizeCourse sets Completed
              if (userId && courseNumericId) {
                fetchUserCourseProgress(userId, courseNumericId, { fresh: true }).then(({ completedModules, progressStatus }) => {
                  dispatch(initializeModuleReadState(completedModules));
                  setCourseProgress((p) => ({ ...p, progressStatus, needsFeedbackSubmission: false }));
                  if (progressStatus === "Completed") {
                    getLatestSubmission(userId, courseNumericId).then((res) => {
                      setCourseProgress((p) => ({ ...p, quizScore: res?.submission?.score }));
                    });
                  }
                });
              }
            }}
            userId={userId}
            courseId={courseNumericId}
          />
        </PageContainer>
      </LayoutShell>
    );
  }

  if (showFullReadingView) {
    return (
      <CourseTextOrPdf
        course={course}
        category={category}
        selectedModule={currentModule}
        onBack={() => setShowFullReadingView(false)}
        onMarkAsRead={() => handleMarkAsRead(currentModule?.moduleId || currentModule?.id)}
        onNextLecture={handleNextLecture}
        isRead={currentModule?.mark_as_read || false}
      />
    );
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
                current={currentModule?.moduleId || currentModule?.id || 0}
                courseId={course.documentId}
                category={category}
                course={course}
                onMarkAsRead={handleMarkAsRead}
              />
              <FinalAssessment
                unlocked={allModulesCompleted}
                category={category}
                courseId={course.documentId}
                isCompleted={courseProgress.progressStatus === "Completed"}
                quizScore={courseProgress.quizScore}
                hasPendingReattempt={courseProgress.hasPendingReattempt}
                needsFeedbackSubmission={courseProgress.needsFeedbackSubmission}
                onOpenFeedback={() => setShowFeedbackForm(true)}
              />
            </div>
          </div>
        </PageSection>
      </main>
    </div>
  );
}

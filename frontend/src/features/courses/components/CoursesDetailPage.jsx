import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { FolderOpen, Clock, Maximize2, Languages, User, ListOrdered } from "lucide-react";
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
import { markModuleAsRead, initializeModuleReadState, loadCourseById } from "@/features/courses/coursesSlice";
import { markModuleProgress, markModuleVideoProgress, fetchUserCourseProgress } from "@/features/courses/coursesAPI";
import { getLatestSubmission, checkPendingReattemptRequest } from "../quizSubmissionAPI";
import { getCurrentUserId } from "@/lib/auth";

function extractOrientationTopics(topicsToCover) {
  if (!Array.isArray(topicsToCover)) return [];
  const items = [];
  topicsToCover.forEach((block) => {
    const children = block.children || [];
    children.forEach((node) => {
      if (node.type === "list-item" && Array.isArray(node.children)) {
        const text = node.children.map((c) => c.text || "").join("").trim();
        if (text) items.push(text);
      }
    });
  });
  return items;
}

function OrientationDetailCard({ orientation }) {
  const topics = extractOrientationTopics(orientation.topics_to_cover);
  const flow = orientation.orientation_flow || "—";
  const trainer = orientation.trainer_name || "—";
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <div className="font-semibold text-gray-800 text-lg mb-3">Orientation details</div>
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex gap-2">
          
          <span><strong className="text-gray-700">Orientation flow:</strong> {flow}</span>
        </div>
        <div className="flex gap-2">
          
          <span><strong className="text-gray-700">Trainer:</strong> {trainer}</span>
        </div>
        {topics.length > 0 && (
          <div>
            <strong className="text-gray-700">Topics to cover:</strong>
            <ul className="mt-1.5 list-disc list-inside space-y-0.5 pl-1">
              {topics.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesDetailPage({ category, course, selectedModule, initialLanguage }) {
  const courseLanguages = course?.languages ?? course?.course_language ?? [];
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => initialLanguage || courseLanguages[0] || "English"
  );
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleIdFromPath = params?.moduleId;
  const [showFullReadingView, setShowFullReadingView] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [courseProgress, setCourseProgress] = useState({ progressStatus: null, quizScore: null, hasPendingReattempt: false, hasRejectedReattempt: false, needsFeedbackSubmission: false });
  const skipNextProgressUpdate = useRef(false);

  // If initialLanguage (e.g. English) is not actually available for this course
  // but the backend reports a single language (e.g. Gujarati), automatically
  // switch the selection to the first available course language.
  useEffect(() => {
    if (!Array.isArray(courseLanguages) || courseLanguages.length === 0) return;
    const selectedNorm = (selectedLanguage || "").trim().toLowerCase();
    const hasSelected = courseLanguages.some(
      (l) => (l || "").trim().toLowerCase() === selectedNorm
    );
    if (!hasSelected) {
      setSelectedLanguage(courseLanguages[0]);
    }
  }, [courseLanguages, selectedLanguage]);

  // If user comes from course card with ?feedback=1, open feedback form directly
  const feedbackFromQuery = searchParams.get('feedback');
  useEffect(() => {
    if (feedbackFromQuery === '1') {
      setShowFeedbackForm(true);
    }
  }, [feedbackFromQuery]);

  if (!course) return <div className="p-8">Course not found.</div>;

  // Show only modules, quiz, and feedback for the selected language
  const allModulesList = Array.isArray(course.modulesList) ? course.modulesList : [];
  const selectedLangNorm = (selectedLanguage || "").trim().toLowerCase();
  const filteredModules = allModulesList.filter(
    (m) => (m.language || "").trim().toLowerCase() === selectedLangNorm
  );
  const contents =
    filteredModules.length > 0
      ? filteredModules
      : allModulesList.length > 0 && courseLanguages.some((l) => (l || "").trim().toLowerCase() === selectedLangNorm)
        ? allModulesList
        : [];
  const allQuizzes = Array.isArray(course.quiz) ? course.quiz : [];
  const filteredQuizzes = allQuizzes.filter(
    (q) => (q.language || "").trim().toLowerCase() === selectedLangNorm
  );
  const quizzes =
    filteredQuizzes.length > 0
      ? filteredQuizzes
      : allQuizzes.length > 0 && courseLanguages.some((l) => (l || "").trim().toLowerCase() === selectedLangNorm)
        ? allQuizzes
        : [];
  const allFeedbacks = Array.isArray(course.feedback) ? course.feedback : [];
  const feedbacks = allFeedbacks.filter(
    (fb) => (fb.language || "").trim().toLowerCase() === selectedLangNorm
  );
  const allOrientationDetails = Array.isArray(course.orientation_detail) ? course.orientation_detail : [];
  const orientation =
    allOrientationDetails.find((o) => (o.language || "").trim().toLowerCase() === selectedLangNorm) ??
    (allOrientationDetails.length > 0 && courseLanguages.some((l) => (l || "").trim().toLowerCase() === selectedLangNorm)
      ? allOrientationDetails[0]
      : null);
  const allModulesCompleted = contents.length > 0 && contents.every((m) => m.mark_as_read);
  const hasQuizInSelectedLanguage = filteredQuizzes.length > 0;
  // For debugging:
  // console.log('modules:', contents)

  const moduleIdFromQuery = searchParams.get('moduleId');
  const requestedModuleId = moduleIdFromPath || moduleIdFromQuery;
  const currentModule =
    (requestedModuleId
      ? contents.find((m) => String(m.moduleId || m.id) === String(requestedModuleId))
      : null) || contents[0] || null;
  const currentModuleIdx = currentModule
    ? contents.findIndex((m) => String(m.moduleId || m.id) === String(currentModule.moduleId || currentModule.id))
    : -1;
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
    ]).then(([{ completedModules, progressStatus }, reattemptStatus]) => {
      const hasPending = reattemptStatus?.hasPending ?? false;
      const hasRejected = reattemptStatus?.hasRejected ?? false;
      if (skipNextProgressUpdate.current) {
        skipNextProgressUpdate.current = false;
        setCourseProgress((p) => ({ ...p, progressStatus, hasPendingReattempt: hasPending, hasRejectedReattempt: hasRejected }));
        return;
      }
      dispatch(initializeModuleReadState(completedModules));
      setCourseProgress((p) => ({ ...p, progressStatus, hasPendingReattempt: hasPending, hasRejectedReattempt: hasRejected }));
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
    const courseIdNumeric = course.id != null ? Number(course.id) : null;
    const courseIdForApi = course.id ?? course.documentId;
    const module_ = contents.find((m) => String(m.moduleId || m.id) === String(modId));
    const moduleIndex = module_ != null ? contents.findIndex((m) => String(m.moduleId || m.id) === String(modId)) : -1;

    try {
      await markModuleProgress({ userId, courseId: courseIdForApi, moduleId: String(modId) });
    } catch (err) {
      console.error('Failed to mark module (user-progress):', err?.message ?? err?.status ?? err);
    }

    if (moduleIndex >= 0 && courseIdNumeric != null) {
      try {
        const durationMin = Number(module_?.moduleDuration) || 0;
        await markModuleVideoProgress({
          userId,
          courseId: courseIdNumeric,
          moduleIndex,
          moduleTitle: module_?.moduleTitle || module_?.title || null,
          videoDurationMin: durationMin,
          timeWatchedMin: durationMin,
        });
      } catch (err) {
        console.error('Failed to mark module (module-video-progress):', err?.message ?? err?.status ?? err);
      }
    }

    try {
      if (courseIdForApi) {
        const { completedModules } = await fetchUserCourseProgress(userId, courseIdForApi, { fresh: true });
        skipNextProgressUpdate.current = true;
        dispatch(initializeModuleReadState(completedModules));
      }
    } catch (err) {
      if (courseIdForApi) {
        fetchUserCourseProgress(userId, courseIdForApi, { fresh: true }).then(({ completedModules }) => {
          dispatch(initializeModuleReadState(completedModules));
        });
      }
    }
  };

  // Handle language change with context-aware confirmation when user has progress
  const handleLanguageChange = (lang) => {
    if (!lang || lang === selectedLanguage) return;
    const hasProgress =
      courseProgress.progressStatus === "In_progress" ||
      courseProgress.progressStatus === "Completed";

    if (hasProgress) {
      let message;
      // Case 1: user is leaving the original language where they already progressed
      if (initialLanguage && selectedLanguage === initialLanguage && lang !== initialLanguage) {
        message = `If you switch to "${lang}", this course will start again from the beginning in that language. Your existing progress in "${initialLanguage}" will be kept. Do you want to continue?`;
      }
      // Case 2: user is switching back to the original language (e.g. Hindi -> English)
      else if (initialLanguage && lang === initialLanguage) {
        message = `You already have progress in "${initialLanguage}". Switching back will continue from where you left off in that language. Do you want to continue?`;
      }
      // Fallback generic message
      else {
        message = 'If you switch the language, this course will start again from the beginning in the new language. Do you want to continue?';
      }

      const confirmed = window.confirm(message);
      if (!confirmed) return;
    }

    setSelectedLanguage(lang);

    const paramsCopy = new URLSearchParams(searchParams?.toString() || "");
    paramsCopy.set("lang", lang);
    paramsCopy.delete("moduleId"); // force restart from first module in new language

    const basePath = `/courses/${category}/${course.documentId}`;
    const queryString = paramsCopy.toString();
    const target = queryString ? `${basePath}?${queryString}` : basePath;
    router.replace(target);

    dispatch(loadCourseById({ documentId: course.documentId, language: lang }));
  };

  const handleNextLecture = () => {
    if (!nextModule || !course?.documentId) return;
    const base = `/courses/${category}/${course.documentId}/${nextModule.moduleId || nextModule.id}`;
    const lang = selectedLanguage ? `?lang=${encodeURIComponent(selectedLanguage)}` : "";
    router.push(`${base}${lang}`);
  };

  // Feedback form: when user passed quiz but hasn't submitted feedback
  if (showFeedbackForm) {
    const feedbackForLang = feedbacks[0];
    const feedbackQuestions = feedbackForLang?.feedback_question || [];
    const userId = getCurrentUserId();
    const courseNumericId = course.id ?? course.documentId;

    return (
      <LayoutShell>
        <PageContainer className="py-8">
          <FeedbackForm
            questions={feedbackQuestions}
                onCancel={() => {
                  setShowFeedbackForm(false);
                  // Remove feedback query param so we don't auto-open again
                  const paramsCopy = new URLSearchParams(searchParams?.toString() || "");
                  paramsCopy.delete("feedback");
                  const queryString = paramsCopy.toString();
                  const target = queryString ? `${pathname}?${queryString}` : pathname;
                  router.replace(target);
                }}
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

  const languageOptions =
    Array.isArray(courseLanguages) && courseLanguages.length > 0 ? courseLanguages : ["English"];

  return (
    <div className="min-h-screen bg-[#fafafa]" style={courseBgStyle}>
      <PageHeader
        title={course.title}
        titleRight={
          languageOptions.length > 0 ? (
            <div className="flex items-center gap-2 bg-white/90 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <Languages className="w-4 h-4 text-gray-500" aria-hidden />
              <label htmlFor="course-language-select" className="text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="course-language-select"
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          ) : null
        }
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
                selectedLanguage={selectedLanguage}
                onMarkAsRead={handleMarkAsRead}
              />
              <FinalAssessment
                unlocked={allModulesCompleted}
                category={category}
                courseId={course.documentId}
                isCompleted={courseProgress.progressStatus === "Completed"}
                quizScore={courseProgress.quizScore}
                hasPendingReattempt={courseProgress.hasPendingReattempt}
                hasRejectedReattempt={courseProgress.hasRejectedReattempt}
                needsFeedbackSubmission={courseProgress.needsFeedbackSubmission}
                onOpenFeedback={() => setShowFeedbackForm(true)}
                selectedLanguage={selectedLanguage}
                hasQuizInSelectedLanguage={hasQuizInSelectedLanguage}
              />
              {orientation && (
                <OrientationDetailCard orientation={orientation} />
              )}
            </div>
          </div>
        </PageSection>
      </main>
    </div>
  );
}

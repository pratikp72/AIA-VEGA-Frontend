import React, { useState, useEffect, useRef, useMemo } from "react";
import MarkdownIt from "markdown-it";
import { useRouter, useParams, usePathname, useSearchParams } from "next/navigation";
import { FolderOpen, Clock, Maximize2, Languages, User, ListOrdered, CheckCircle2 } from "lucide-react";
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
import telemetryService from '@/services/telemetry';

const md = new MarkdownIt({ html: true, breaks: true });

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
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [courseProgress, setCourseProgress] = useState({ progressStatus: null, quizScore: null, hasPendingReattempt: false, hasRejectedReattempt: false, needsFeedbackSubmission: false, progressPercentage: 0 });
  const skipNextProgressUpdate = useRef(false);
  const [pdfPreviewBlobUrl, setPdfPreviewBlobUrl] = useState('');
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);
  const videoRef = useRef(null);
  const lastVideoHeartbeatSecRef = useRef(0);
  const moduleEnterTimeRef = useRef(null); // tracks when user entered current module

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
  const totalModuleTimeMin = contents.reduce((sum, m) => {
    const d = Number(m.moduleDuration);
    return sum + (Number.isFinite(d) && d > 0 ? d : 0);
  }, 0);
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

  useEffect(() => {
    const courseId = course?.id;
    const moduleId = currentModule?.moduleId ?? currentModule?.id;
    if (courseId == null || moduleId == null) return;

    const routePath = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : pathname;
    const moduleTitle = currentModule?.moduleTitle || currentModule?.title || null;

    moduleEnterTimeRef.current = Date.now();

    telemetryService.trackLearningModuleEnter({
      courseId,
      moduleIndex: currentModuleIdx,
      moduleTitle,
      routePath,
      metadata: {
        module_id: String(moduleId),
        language: selectedLanguage,
      },
    });

    return () => {
      telemetryService.trackLearningModuleExit({
        courseId,
        moduleIndex: currentModuleIdx,
        moduleTitle,
        routePath,
        metadata: {
          module_id: String(moduleId),
          language: selectedLanguage,
        },
      });
      telemetryService.flushWithKeepalive();
    };
  }, [course?.id, currentModule?.moduleId, currentModule?.id, currentModuleIdx, currentModule?.moduleTitle, currentModule?.title, pathname, searchParams, selectedLanguage]);

  useEffect(() => {
    const sourceUrl = currentModule?.pdf_file?.url;
    const isPdf = String(currentModule?.moduleType || '').toLowerCase() === 'pdf';

    if (!isPdf || !sourceUrl) {
      setPdfPreviewBlobUrl('');
      setPdfPreviewLoading(false);
      return;
    }

    let active = true;
    let nextBlobUrl = '';
    const controller = new AbortController();

    const loadPdfPreview = async () => {
      setPdfPreviewLoading(true);
      try {
        const headers = {};
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(sourceUrl, { headers, signal: controller.signal });
        if (!response.ok) throw new Error(`PDF request failed: ${response.status}`);
        const blob = await response.blob();
        nextBlobUrl = URL.createObjectURL(blob);
        if (active) setPdfPreviewBlobUrl(nextBlobUrl);
      } catch {
        if (active) setPdfPreviewBlobUrl('');
      } finally {
        if (active) setPdfPreviewLoading(false);
      }
    };

    loadPdfPreview();

    return () => {
      active = false;
      controller.abort();
      if (nextBlobUrl) URL.revokeObjectURL(nextBlobUrl);
    };
  }, [currentModule?.pdf_file?.url, currentModule?.moduleType]);

  // Fetch per-user read state from user-progress whenever the course loads.
  // This replaces the shared mark_as_read from the course schema.
  useEffect(() => {
    const userId = getCurrentUserId();
    const courseIdForApi = course?.id ?? course?.documentId;
    if (!courseIdForApi || !userId) return;
    Promise.all([
      fetchUserCourseProgress(userId, courseIdForApi, { fresh: true }),
      checkPendingReattemptRequest(userId, courseIdForApi),
    ]).then(([{ completedModules, progressStatus, feedbackSubmitted, progressPercentage }, reattemptStatus]) => {
      const hasPending = reattemptStatus?.hasPending ?? false;
      const hasRejected = reattemptStatus?.hasRejected ?? false;
      if (skipNextProgressUpdate.current) {
        skipNextProgressUpdate.current = false;
        setCourseProgress((p) => ({ ...p, progressStatus, progressPercentage, hasPendingReattempt: hasPending, hasRejectedReattempt: hasRejected }));
        return;
      }
      dispatch(initializeModuleReadState(completedModules));
      setCourseProgress((p) => ({ ...p, progressStatus, progressPercentage, hasPendingReattempt: hasPending, hasRejectedReattempt: hasRejected }));
      if (progressStatus === "Completed") {
        getLatestSubmission(userId, courseIdForApi).then((res) => {
          const score = res?.submission?.score;
          setCourseProgress((p) => ({ ...p, quizScore: score }));
        });
      } else if (progressStatus === "In_progress") {
        // Check if user passed quiz but hasn't submitted feedback (course not fully completed)
        getLatestSubmission(userId, courseIdForApi).then((res) => {
          const passed = res?.submission?.passed === true;
          setCourseProgress((p) => ({ ...p, needsFeedbackSubmission: passed && !feedbackSubmitted }));
        });
      } else {
        setCourseProgress((p) => ({ ...p, needsFeedbackSubmission: false }));
      }
    });
  }, [course?.id, course?.documentId, dispatch]);


  const handleMarkAsRead = async (modId) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    dispatch(markModuleAsRead({ moduleId: modId })); // instant UI update

    // Optimistically update the progress percentage immediately (modules = 80% weight)
    const alreadyCompleted = contents.filter((m) => m.mark_as_read).length;
    const newCompleted = alreadyCompleted + 1;
    const totalModules = contents.length;
    if (totalModules > 0) {
      const optimisticPct = Math.round((newCompleted / totalModules) * 80);
      setCourseProgress((p) => ({ ...p, progressPercentage: Math.max(p.progressPercentage, optimisticPct) }));
    }

    const courseIdNumeric = course.id != null ? Number(course.id) : null;
    const courseIdForApi = course.id ?? course.documentId;
    const module_ = contents.find((m) => String(m.moduleId || m.id) === String(modId));
    const moduleIndex = module_ != null ? contents.findIndex((m) => String(m.moduleId || m.id) === String(modId)) : -1;
    const routePath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : pathname;

    // Calculate actual time spent before both POST calls below need it
    const durationMin = Number(module_?.moduleDuration) || 0;
    const elapsedMin = moduleEnterTimeRef.current
      ? Math.max(1, Math.round((Date.now() - moduleEnterTimeRef.current) / 60000))
      : durationMin;
    const timeWatchedMin = durationMin > 0 ? Math.min(elapsedMin, durationMin) : elapsedMin;

    try {
      await markModuleProgress({
        userId,
        courseId: courseIdForApi,
        moduleId: String(modId),
        timeSpentMinutes: timeWatchedMin,
        selectedLanguage,
        // Send started_at only when course hasn't been started yet (first module marked)
        startedAt: (!courseProgress.progressStatus || courseProgress.progressStatus === 'Not_started')
          ? new Date().toISOString()
          : null,
      });
    } catch (err) {
      console.error('Failed to mark module (user-progress):', err?.message ?? err?.status ?? err);
    }

    if (moduleIndex >= 0 && courseIdNumeric != null) {
      try {
        // full_watch if user watched ≥ 90% of the duration, otherwise in_progress
        const completionType =
          durationMin > 0 && timeWatchedMin >= durationMin * 0.9 ? 'full_watch' : 'in_progress';
        await markModuleVideoProgress({
          userId,
          courseId: courseIdNumeric,
          moduleIndex,
          moduleTitle: module_?.moduleTitle || module_?.title || null,
          videoDurationMin: durationMin,
          timeWatchedMin,
          videoCompletionType: completionType,
        });
      } catch (err) {
        console.error('Failed to mark module (module-video-progress):', err?.message ?? err?.status ?? err);
      }
    }

    try {
      if (courseIdForApi) {
        const { completedModules, progressPercentage } = await fetchUserCourseProgress(userId, courseIdForApi, { fresh: true });
        skipNextProgressUpdate.current = true;
        dispatch(initializeModuleReadState(completedModules));
        setCourseProgress((p) => ({ ...p, progressPercentage }));
      }
    } catch (err) {
      if (courseIdForApi) {
        fetchUserCourseProgress(userId, courseIdForApi, { fresh: true }).then(({ completedModules, progressPercentage }) => {
          dispatch(initializeModuleReadState(completedModules));
          setCourseProgress((p) => ({ ...p, progressPercentage }));
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

  const handleVideoLoadedMetadata = () => {
    const v = videoRef.current;
    lastVideoHeartbeatSecRef.current = v ? Number(v.currentTime || 0) : 0;
  };

  const handleVideoTimeUpdate = () => {
    const courseId = course?.id;
    if (courseId == null || currentModule?.moduleType !== 'Video') return;

    const v = videoRef.current;
    if (!v) return;

    const current = Number(v.currentTime || 0);
    const last = Number(lastVideoHeartbeatSecRef.current || 0);
    const delta = current - last;
    if (delta < 10) return;

    lastVideoHeartbeatSecRef.current = current;
    telemetryService.trackLearningVideoProgress({
      courseId,
      moduleIndex: currentModuleIdx,
      moduleTitle: currentModule?.moduleTitle || currentModule?.title || null,
      routePath: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : pathname,
      durationSeconds: Math.max(1, Math.round(delta)),
      watchedSeconds: Math.round(current),
      metadata: {
        module_id: String(currentModule?.moduleId ?? currentModule?.id ?? ''),
        language: selectedLanguage,
      },
    });
  };

  const handleVideoEnded = () => {
    const courseId = course?.id;
    if (courseId == null || currentModule?.moduleType !== 'Video') return;

    const v = videoRef.current;
    const duration = Number(v?.duration || v?.currentTime || 0);
    const last = Number(lastVideoHeartbeatSecRef.current || 0);
    const tailDelta = duration - last;

    if (tailDelta >= 1) {
      telemetryService.trackLearningVideoProgress({
        courseId,
        moduleIndex: currentModuleIdx,
        moduleTitle: currentModule?.moduleTitle || currentModule?.title || null,
        routePath: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : pathname,
        durationSeconds: Math.max(1, Math.round(tailDelta)),
        watchedSeconds: Math.round(duration),
        metadata: {
          module_id: String(currentModule?.moduleId ?? currentModule?.id ?? ''),
          language: selectedLanguage,
        },
      });
    }

    lastVideoHeartbeatSecRef.current = duration;
    telemetryService.trackLearningVideoCompleted({
      courseId,
      moduleIndex: currentModuleIdx,
      moduleTitle: currentModule?.moduleTitle || currentModule?.title || null,
      routePath: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : pathname,
      durationSeconds: Math.max(1, Math.round(duration)),
      watchedSeconds: Math.round(duration),
      metadata: {
        module_id: String(currentModule?.moduleId ?? currentModule?.id ?? ''),
        language: selectedLanguage,
      },
    });
  };

  // Feedback success: show "Thank you" screen briefly after feedback submission
  if (showFeedbackSuccess) {
    return (
      <LayoutShell hideSidebar>
        <PageContainer className="py-8 flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl w-full text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-14 h-14 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Thank you!
            </h2>
            <p className="text-gray-600 mb-4">
              Your feedback has been submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the course page...
            </p>
          </div>
        </PageContainer>
      </LayoutShell>
    );
  }

  // Feedback form: when user passed quiz but hasn't submitted feedback
  if (showFeedbackForm) {
    const feedbackForLang = feedbacks[0];
    const feedbackQuestions = feedbackForLang?.feedback_question || [];
    const userId = getCurrentUserId();
    const courseNumericId = course.id ?? course.documentId;

    return (
      <LayoutShell hideSidebar>
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
              setShowFeedbackSuccess(true);
              // Refetch progress - backend finalizeCourse sets Completed
              if (userId && courseNumericId) {
                fetchUserCourseProgress(userId, courseNumericId, { fresh: true }).then(({ completedModules, progressStatus, progressPercentage }) => {
                  dispatch(initializeModuleReadState(completedModules));
                  setCourseProgress((p) => ({ ...p, progressStatus, progressPercentage, needsFeedbackSubmission: false }));
                  if (progressStatus === "Completed") {
                    getLatestSubmission(userId, courseNumericId).then((res) => {
                      setCourseProgress((p) => ({ ...p, quizScore: res?.submission?.score }));
                    });
                  }
                });
              }
              // Auto-hide success screen after 3 seconds
              setTimeout(() => setShowFeedbackSuccess(false), 3000);
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
                <>
                  <div className="relative max-h-[467px] overflow-hidden rounded-xl mt-2">
                    <video
                      ref={videoRef}
                      controls
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      className="w-full h-full object-cover rounded-xl"
                    >
                      <source
                        src={currentModule.video_file?.url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  {currentModule?.description && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
                      <div
                        className="rich-content"
                        dangerouslySetInnerHTML={{ __html: md.render(currentModule.description) }}
                      />
                    </div>
                  )}
                </>
              ) : String(currentModule?.moduleType || '').toLowerCase() === 'pdf' ? (
                <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
                  {currentModule?.pdf_file?.url ? (
                    <>
                      <div className="w-full h-[467px] overflow-hidden">
                        {pdfPreviewLoading ? (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            Loading PDF preview...
                          </div>
                        ) : pdfPreviewBlobUrl ? (
                          <iframe
                            src={pdfPreviewBlobUrl}
                            title={currentModule.moduleTitle || 'PDF preview'}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 px-4 text-center">
                            Inline PDF preview is not available. Use full view or open it in a new tab.
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <button
                          onClick={() => setShowFullReadingView(true)}
                          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition cursor-pointer"
                        >
                          <Maximize2 className="w-4 h-4" />
                          View Full PDF
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-gray-500 italic">No PDF file available.</div>
                  )}
                </div>
              ) : currentModule?.moduleType === 'Text' ? (
                <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
                  {/* Reading Content Preview Container */}
                  <div className="p-4 space-y-5 max-h-[467px] overflow-y-auto">
                    {currentModule.text_content ? (
                      <div
                        className="rich-content text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: currentModule.text_content }}
                      />
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
              <CourseStats course={course} progressPercentage={courseProgress.progressPercentage} quizScore={courseProgress.quizScore} totalModuleTimeMin={totalModuleTimeMin} />
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
            </div>
          </div>
        </PageSection>
      </main>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  MOCK_ASSESSMENT_QUESTIONS,
  MOCK_ASSESSMENT_RESULTS,
  getCourseFeedbackConfig,
} from "@/services/mockData";
import { submitQuiz, getLatestSubmission, sendReattemptRequest, checkPendingReattemptRequest } from "../quizSubmissionAPI";
import FeedbackForm from "./FeedbackForm";
import LayoutShell from "@/components/layout/LayoutShell";
import PageContainer from "@/components/layout/PageContainer";
import telemetryService from '@/services/telemetry';

function ResultScreen({
  passed,
  score,
  resultData,
  onBackToCourses,
  onTryAgain,
  onSendReattemptRequest,
  feedbackMandatory,
  feedbackSubmitted,
  onOpenFeedback,
  attemptNumber,
  maxAttempt,
  reattemptRequired,
  reattemptSent,
  reattemptLoading,
  reattemptError,
}) {
  const canGoBack = passed
    ? !feedbackMandatory || feedbackSubmitted || reattemptSent
    : (reattemptRequired ? reattemptSent : true);
  const backButtonClass = canGoBack
    ? "w-full py-3 rounded-xl bg-success text-white hover:bg-success/90 transition cursor-pointer"
    : "w-full py-3 rounded-xl bg-gray-300 text-gray-500 cursor-not-allowed";

  if (passed) {
    const passHeading = score != null ? `Passed ${score}%` : "Passed";
    return (
      <div className="fixed inset-0 z-50 bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-147.75 p-4 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-semibold text-success mb-4">
            {passHeading}
          </h2>
          <p className="font-semibold text-foreground/60 leading-relaxed mb-4">
            {resultData.pass.message}
          </p>
          {attemptNumber !== undefined && maxAttempt !== undefined && (
            <p className="text-sm font-semibold text-foreground/60 mb-2">
              Attempt {Math.min(attemptNumber, maxAttempt)} of {maxAttempt}
            </p>
          )}
          <p className="text-xs font-semibold text-foreground/60 leading-relaxed mb-8">
            {resultData.pass.subMessage}
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={reattemptSent ? undefined : onOpenFeedback}
              disabled={reattemptSent}
              className={`w-full py-3 rounded-xl border-2 border-primary font-semibold transition ${
                reattemptSent
                  ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                  : "bg-white text-primary hover:bg-primary/5 cursor-pointer"
              }`}
            >
              Submit Feedback
            </button>
            <button
              type="button"
              onClick={canGoBack ? onBackToCourses : undefined}
              disabled={!canGoBack}
              className={backButtonClass}
            >
              {resultData.pass.buttonText}
            </button>
          </div>
          {feedbackMandatory && !feedbackSubmitted && (
            <p className="text-xs text-muted-foreground mt-2">
              Please submit feedback to continue to courses.
            </p>
          )}
        </div>
      </div>
    );
  }

  const failBackClass = canGoBack
    ? "flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
    : "flex-1 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-147.75 p-10 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-12 h-12 text-destructive" />
        </div>
        {/** Keep heading static so UI does not depend on optional quiz title fields. */}
        <h2 className="text-xl font-bold text-destructive mb-4">
          {reattemptRequired
            ? `Maximum attempts reached`
            : `Not Passed ${score}%`}
        </h2>
        <p className="text-sm font-medium text-destructive leading-relaxed mb-4">
          {reattemptRequired
            ? `You have used all ${maxAttempt} attempt(s). Please request a reattempt from your administrator.`
            : resultData.fail.message}
        </p>
        {attemptNumber !== undefined && maxAttempt !== undefined ? (
          <p className="text-gray-600 mb-3 font-semibold">
            Attempt {Math.min(attemptNumber, maxAttempt)} of {maxAttempt}
          </p>
        ) : (
          <p className="text-gray-600 mb-3 font-semibold">
            {resultData.fail.attemptsInfo}
          </p>
        )}
        <p className="text-gray-600 mb-3 font-semibold">
          {resultData.fail.contactInfo}
        </p>
        <p className="text-xs text-gray-400 leading-relaxed mb-8 font-semibold">
          {resultData.fail.subMessage}
        </p>
        <div className="flex flex-col gap-3">
          {reattemptError && (
            <p className="text-sm text-destructive font-medium">{reattemptError}</p>
          )}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={canGoBack ? onBackToCourses : undefined}
              disabled={!canGoBack}
              className={failBackClass}
            >
              {resultData.fail.secondaryButtonText}
            </button>
            {reattemptRequired && attemptNumber != null && maxAttempt != null && attemptNumber === maxAttempt ? (
              <button
                type="button"
                onClick={onSendReattemptRequest}
                disabled={reattemptLoading || reattemptSent}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {reattemptSent
                  ? "Request sent"
                  : reattemptLoading
                    ? "Sending..."
                    : "Send Re-attempt Request"}
              </button>
            ) : (
              <button
                onClick={onTryAgain}
                className="flex-1 py-3 rounded-xl bg-destructive/10 border border-destructive text-destructive font-semibold hover:bg-destructive/20 transition cursor-pointer"
              >
                {resultData.fail.primaryButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getQuestionOptions(question) {
  if (!question) return [];
  const q = question?.attributes ?? question;
  const raw =
    q.options ??
    q.choices ??
    q.question_options ??
    question?.options ??
    question?.choices ??
    question?.question_options ??
    [];
  const arr = Array.isArray(raw)
    ? raw
    : raw?.data && Array.isArray(raw.data)
      ? raw.data
      : [];
  return arr.map((opt) => {
    if (opt == null) return { option_key: "", option_label: "" };
    const attrs = opt.attributes ?? opt;
    return {
      option_key: attrs.option_key ?? opt.option_key ?? "",
      option_label: attrs.option_label ?? opt.option_label ?? opt.text ?? opt.label ?? String(opt.id ?? ""),
    };
  });
}

export default function AssessmentQuiz({ onExit, courseId, category, courseNumericId, userId, quizQuestions, resultData: resultDataProp, feedbackQuestions, feedbackCompulsory, quizDuration }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const questions = Array.isArray(quizQuestions) && quizQuestions.length > 0 ? quizQuestions : MOCK_ASSESSMENT_QUESTIONS;
  const resultData = resultDataProp || MOCK_ASSESSMENT_RESULTS;
  const totalQuestions = questions.length;
  // Use compulsory flag from the backend feedback component; fall back to mock for legacy/dev
  const feedbackMandatory = feedbackCompulsory ?? getCourseFeedbackConfig(courseId).mandatory;
  const quizDurationSeconds = (quizDuration != null && quizDuration > 0 ? quizDuration : 30) * 60;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quizDurationSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(undefined);
  const [maxAttempt, setMaxAttempt] = useState(undefined);
  const [reattemptRequired, setReattemptRequired] = useState(false);
  const [reattemptSent, setReattemptSent] = useState(false);
  const [reattemptLoading, setReattemptLoading] = useState(false);
  const [reattemptError, setReattemptError] = useState(null);
  const [showReattemptSuccessModal, setShowReattemptSuccessModal] = useState(false);
  const [violationWarning, setViolationWarning] = useState(false);

  // Refs for stable access inside event-handler closures (avoid stale state)
  const isSubmittingRef = useRef(false);
  const submittedRef = useRef(false);
  const answersRef = useRef({});
  const timeLeftRef = useRef(quizDurationSeconds);

  const currentQuestion = questions[currentIndex];

  // When re-request succeeds: show modal and redirect to course page in 5-6 sec
  useEffect(() => {
    if (!reattemptSent || !category || !courseId) return;
    setShowReattemptSuccessModal(true);
    const timer = setTimeout(() => {
      router.push(`/courses/${category}/${courseId}`);
    }, 5500);
    return () => clearTimeout(timer);
  }, [reattemptSent, category, courseId, router]);

  // Keep refs in sync with state so event-handler closures always see fresh values
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ── Fullscreen: request on mount, exit when quiz is submitted ──────────────
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (submitted && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [submitted]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionIndex) => {
    const isMulti = currentQuestion.question_type === 'Multiple_select';
    
    setAnswers((prev) => {
      if (isMulti) {
        const currentAns = prev[currentQuestion.id] || [];
        const ansArray = Array.isArray(currentAns) ? currentAns : [currentAns];
        
        if (ansArray.includes(optionIndex)) {
            // Remove
            const newAns = ansArray.filter(idx => idx !== optionIndex);
            if (newAns.length === 0) {
              const { [currentQuestion.id]: _, ...rest } = prev;
              return rest;
            }
            return { ...prev, [currentQuestion.id]: newAns };
        } else {
            // Add
            return { ...prev, [currentQuestion.id]: [...ansArray, optionIndex] };
        }
      } else {
         return { ...prev, [currentQuestion.id]: optionIndex };
      }
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const hasAnswered = answers[currentQuestion?.id] !== undefined && 
    (!Array.isArray(answers[currentQuestion?.id]) || answers[currentQuestion?.id].length > 0);


  const handleNext = () => {
    if (!hasAnswered) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // ── Core submit logic (used by both manual Submit and auto-submit) ─────────
  const performSubmit = useCallback(async (currentAnswers, currentTimeLeft) => {
    if (isSubmittingRef.current || submittedRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const answersArr = questions.map((q) => {
      const selectedIdx = currentAnswers[q.id];
      const opts = getQuestionOptions(q);
      const isMulti = q.question_type === 'Multiple_select';

      let answerPayload = {
        question_id: String(q.question_id || q.id),
        question: q.question_text || q.question,
        question_type: q.question_type || 'Multiple_choice',
        point: q.point || 0,
      };

      if (isMulti) {
        const ansArray = Array.isArray(selectedIdx) ? selectedIdx : (selectedIdx !== undefined ? [selectedIdx] : []);
        answerPayload.selected_answer_for_multiSelect = ansArray.map(idx => {
          const opt = opts[idx];
          return { option_key: opt?.option_key ?? String(idx ?? "") };
        });
      } else {
        const selectedOption = selectedIdx !== undefined && !Array.isArray(selectedIdx) ? opts[selectedIdx] : null;
        answerPayload.selected_answer_for_multiChoice = selectedOption?.option_key ?? String(selectedIdx ?? "");
      }

      return answerPayload;
    });

    const payload = {
      userId: Number(userId),
      courseId: Number(courseNumericId),
      answers: answersArr,
      // Ensure non-zero quiz duration for analytics when submission happens under 60s.
      time_taken_minutes: Math.max(1, Math.round((quizDurationSeconds - currentTimeLeft) / 60)),
      submitted_at: new Date().toISOString(),
    };

    try {
      // Step 1: Submit the quiz — read the response to detect blocked attempts
      const submitRes = await submitQuiz(payload);

      // Step 2: Always fetch latest for attempt/maxAttempt info
      const resultRes = await getLatestSubmission(Number(userId), Number(courseNumericId));
      if (resultRes?.maxAttempt !== undefined) setMaxAttempt(resultRes.maxAttempt);

      const submission = resultRes?.submission;
      const maxAttemptVal = resultRes?.maxAttempt ?? 1;
      const attemptNum = submission?.attempt_number;
      const currentEqualsMax = attemptNum != null && maxAttemptVal != null && attemptNum >= maxAttemptVal;
      const userPassed = submission?.passed === true;

      setScore(submission?.score ?? 0);
      setIsPassed(userPassed);
      if (attemptNum != null) setAttemptNumber(attemptNum);

      // Re-attempt UI only when user actually failed and has used all attempts (never when they passed)
      if (!userPassed && (submitRes?.reattempt_required || currentEqualsMax)) {
        setReattemptRequired(true);
        setIsPassed(false);
        setScore(submission?.score ?? 0);
        if (attemptNum != null) setAttemptNumber(attemptNum);
        const reattemptStatus = await checkPendingReattemptRequest(Number(userId), Number(courseNumericId));
        if (reattemptStatus?.hasPending) setReattemptSent(true);
      } else {
        // New submission was created — show the freshly calculated score
        setScore(submission?.score ?? 0);
        setIsPassed(submission?.passed ?? false);
        if (attemptNum != null) setAttemptNumber(attemptNum);
        // Show re-attempt button when current attempt === max_attempt and failed
        if (!submission?.passed && currentEqualsMax) {
          setReattemptRequired(true);
          const reattemptStatus = await checkPendingReattemptRequest(Number(userId), Number(courseNumericId));
          if (reattemptStatus?.hasPending) setReattemptSent(true);
        }
      }

      telemetryService.trackLearningQuizSubmitted({
        courseId: Number(courseNumericId),
        routePath: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/courses',
        quizId: String(courseNumericId),
        score: submission?.score ?? 0,
        maxScore: 100,
        durationSeconds: Math.max(1, Math.round(quizDurationSeconds - currentTimeLeft)),
        metadata: {
          course_id: Number(courseNumericId),
          user_id: Number(userId),
          passed: userPassed,
          score: submission?.score ?? 0,
          attempt_number: attemptNum ?? null,
          max_attempt: maxAttemptVal ?? null,
          auto_submitted: Boolean(violationWarning),
        },
      });
    } catch (e) {
      console.error('Quiz submission failed', e);
      telemetryService.trackLearningQuizSubmitted({
        courseId: Number(courseNumericId),
        routePath: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/courses',
        quizId: String(courseNumericId),
        score: null,
        maxScore: null,
        durationSeconds: Math.max(1, Math.round(quizDurationSeconds - currentTimeLeft)),
        metadata: {
          course_id: Number(courseNumericId),
          user_id: Number(userId),
          failed: true,
          error: e?.message || 'Quiz submission failed',
        },
      });
    } finally {
      isSubmittingRef.current = false;
      submittedRef.current = true;
      setIsSubmitting(false);
      setSubmitted(true);
    }
  }, [questions, userId, courseNumericId, quizDurationSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual submit — requires current question answered
  const handleSubmit = async () => {
    if (!hasAnswered || isSubmitting) return;
    await performSubmit(answers, timeLeft);
  };

  // Auto-submit triggered by security violations (tab switch / fullscreen exit)
  const handleAutoSubmit = useCallback(() => {
    if (submittedRef.current || isSubmittingRef.current) return;
    setViolationWarning(true);
    performSubmit(answersRef.current, timeLeftRef.current);
  }, [performSubmit]);

  // ── Security: auto-submit on fullscreen exit ───────────────────────────────
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        handleAutoSubmit();
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [handleAutoSubmit]);

  // ── Security: auto-submit on tab switch / window blur ─────────────────────
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !submittedRef.current) {
        handleAutoSubmit();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [handleAutoSubmit]);

  // ── Security: warn on page refresh / navigation away ──────────────────────
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
  const handleTryAgain = () => {
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(quizDurationSeconds);
    setSubmitted(false);
    setIsSubmitting(false);
    setScore(0);
    setIsPassed(false);
    setAttemptNumber(undefined);
    setReattemptRequired(false);
    setViolationWarning(false);
    submittedRef.current = false;
    isSubmittingRef.current = false;
    // Re-enter fullscreen for next attempt
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  const handleSendReattemptRequest = async () => {
    if (reattemptLoading || reattemptSent) return;
    setReattemptLoading(true);
    setReattemptError(null);
    try {
      await sendReattemptRequest(Number(userId), Number(courseNumericId));
      setReattemptSent(true);
      telemetryService.trackLearningEvent('quiz_reattempt_requested', {
        routePath: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/courses',
        entityType: 'quiz',
        entityId: String(courseNumericId),
        pageType: 'CourseAssessment',
        metadata: {
          course_id: Number(courseNumericId),
          user_id: Number(userId),
        },
      });
    } catch (err) {
      const msg = err?.error?.message || err?.message || "Failed to send re-attempt request.";
      setReattemptError(msg);
    } finally {
      setReattemptLoading(false);
    }
  };

  const handleBackToCourses = () => {
    const lang = searchParams?.get('lang');
    const langQuery = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    if (category && courseId) {
      router.push(`/courses/${category}/${courseId}${langQuery}`);
      return;
    }
    if (category) {
      router.push(`/courses/${category}`);
      return;
    }
    if (onExit) onExit();
    else router.push('/courses');
  };

  const openFeedbackForm = () => {
    setShowFeedbackForm(true);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set('feedback', '1');
    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  };

  const closeFeedbackForm = () => {
    setShowFeedbackForm(false);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete('feedback');
    const query = params.toString();
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  };

  const handleFeedbackSubmit = (formData) => {
    const lang = searchParams?.get('lang');
    const langQuery = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    setFeedbackSubmitted(true);
    setShowFeedbackForm(false);
    setShowFeedbackSuccess(true);
    // TODO: send formData to backend when API is ready
    setTimeout(() => {
      if (category && courseId) {
        router.push(`/courses/${category}/${courseId}${langQuery}`);
        return;
      }
      if (category) {
        router.push(`/courses/${category}`);
        return;
      }
      router.push('/courses');
    }, 5000);
  };

  // Success message after feedback submit, then redirect to courses
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

  // When user is on feedback screen, show full layout with sidebar
  if (submitted && showFeedbackForm) {
    return (
      <LayoutShell hideSidebar>
        <PageContainer className="py-8">
          <FeedbackForm
            questions={feedbackQuestions}
            onCancel={closeFeedbackForm}
            onSubmit={handleFeedbackSubmit}
            userId={userId}
            courseId={courseNumericId} // Pass numeric course ID
          />
        </PageContainer>
      </LayoutShell>
    );
  }

  // Re-request success modal: overlay when request sent
  if (submitted && showReattemptSuccessModal) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-14 h-14 text-success" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Request sent successfully</h2>
          <p className="text-gray-600 mb-4">
            Your re-attempt request has been sent to the administrator. You will be notified once it is approved.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to the course page in 5 seconds...
          </p>
        </div>
      </div>
    );
  }

  // Show result screen after submission (before / after feedback)
  if (submitted) {
    return (
      <ResultScreen
        passed={isPassed}
        score={score}
        resultData={resultData}
        onBackToCourses={handleBackToCourses}
        onTryAgain={handleTryAgain}
        onSendReattemptRequest={handleSendReattemptRequest}
        feedbackMandatory={feedbackMandatory}
        feedbackSubmitted={feedbackSubmitted}
        onOpenFeedback={openFeedbackForm}
        attemptNumber={attemptNumber}
        maxAttempt={maxAttempt}
        reattemptRequired={reattemptRequired}
        reattemptSent={reattemptSent}
        reattemptLoading={reattemptLoading}
        reattemptError={reattemptError}
      />
    );
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
      {/* Violation warning overlay — shown briefly when quiz is auto-submitted */}
      {violationWarning && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 text-center">
            <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz Auto-Submitted</h2>
            <p className="text-gray-600 text-sm">
              You switched tabs or exited fullscreen mode. Your quiz has been automatically submitted and scored based on your current answers.
            </p>
          </div>
        </div>
      )}
      {/* Top Bar — floating card */}
      <div className="px-6 pt-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-start justify-center pt-8 pb-6 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-3xl p-4">
          <div className="text-center mb-4">
            <span className="text-primary">
              Question {currentIndex + 1}
            </span>
          </div>

          <div className="h-82.5">
            <h2 className="text-base font-medium text-gray-900 mb-6">
              {currentQuestion.question_text || currentQuestion.question}
            </h2>

            <div className="flex flex-col">
              {getQuestionOptions(currentQuestion).map((option, idx) => {
                const isMulti = currentQuestion.question_type === 'Multiple_select';
                const currentAns = answers[currentQuestion.id];
                const isSelected = isMulti 
                  ? (Array.isArray(currentAns) && currentAns.includes(idx))
                  : currentAns === idx;
                const label = option?.option_label ?? option?.option_key ?? "";
                
                return (
                  <label
                    key={option?.option_key ?? idx}
                    onClick={() => handleSelectOption(idx)}
                    className="flex items-center gap-3 p-4 cursor-pointer rounded-xl border border-gray-100 hover:bg-gray-50 mb-4 shadow-sm"
                  >
                    <span
                      className={`shrink-0 flex items-center justify-center ${
                        isMulti 
                          ? `w-4 h-4 rounded-sm border-2 ${isSelected ? "border-primary bg-primary" : "border-gray-300"}`
                          : `w-3.5 h-3.5 rounded-full border-2 ${isSelected ? "border-primary" : "border-gray-300"}`
                      }`}
                    >
                      {isSelected && !isMulti && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      {isSelected && isMulti && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-6 pb-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1.5 px-7 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer ${
              currentIndex === 0
                ? "bg-gray-300 text-white cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={!hasAnswered || isSubmitting}
            className={`flex items-center gap-1.5 px-7 py-2.5 rounded-full text-sm font-semibold transition ${
              hasAnswered && !isSubmitting
                ? "bg-primary text-white hover:bg-primary/90 cursor-pointer"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}
          >
            {isLastQuestion ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
            {!isSubmitting && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

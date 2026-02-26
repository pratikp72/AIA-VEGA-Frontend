"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import FeedbackForm from "./FeedbackForm";
import LayoutShell from "@/components/layout/LayoutShell";
import PageContainer from "@/components/layout/PageContainer";

function ResultScreen({
  passed,
  score,
  resultData,
  onBackToCourses,
  onTryAgain,
  feedbackMandatory,
  feedbackSubmitted,
  onOpenFeedback,
}) {
  const canGoBack = !feedbackMandatory || feedbackSubmitted;
  const backButtonClass = canGoBack
    ? "w-full py-3 rounded-xl bg-success text-white hover:bg-success/90 transition cursor-pointer"
    : "w-full py-3 rounded-xl bg-gray-300 text-gray-500 cursor-not-allowed";

  if (passed) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-[591px] p-4 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-semibold text-success mb-4">
            {resultData.pass.title} {score}%
          </h2>
          <p className="font-semibold text-foreground/60 leading-relaxed mb-4">
            {resultData.pass.message}
          </p>
          <p className="text-xs font-semibold text-foreground/60 leading-relaxed mb-8">
            {resultData.pass.subMessage}
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onOpenFeedback}
              className="w-full py-3 rounded-xl border-2 border-primary bg-white text-primary font-semibold hover:bg-primary/5 transition cursor-pointer"
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
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[591px] p-10 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-destructive mb-4">
          {resultData.fail.title} {score}%
        </h2>
        <p className="text-sm font-medium text-destructive leading-relaxed mb-4">
          {resultData.fail.message}
        </p>
        <p className="text-gray-600 mb-3 font-semibold">
          {resultData.fail.attemptsInfo}
        </p>
        <p className="text-gray-600 mb-3 font-semibold">
          {resultData.fail.contactInfo}
        </p>
        <p className="text-xs text-gray-400 leading-relaxed mb-8 font-semibold">
          {resultData.fail.subMessage}
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onOpenFeedback}
            className="w-full py-3 rounded-xl border-2 border-primary bg-white text-primary font-semibold hover:bg-primary/5 transition cursor-pointer"
          >
            Submit Feedback
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={canGoBack ? onBackToCourses : undefined}
              disabled={!canGoBack}
              className={failBackClass}
            >
              {resultData.fail.secondaryButtonText}
            </button>
            <button
              onClick={onTryAgain}
              className="flex-1 py-3 rounded-xl bg-destructive/10 border border-destructive text-destructive font-semibold hover:bg-destructive/20 transition cursor-pointer"
            >
              {resultData.fail.primaryButtonText}
            </button>
          </div>
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

export default function AssessmentQuiz({ onExit, courseId, quizQuestions, resultData: resultDataProp }) {
  const router = useRouter();
  const questions = Array.isArray(quizQuestions) && quizQuestions.length > 0 ? quizQuestions : MOCK_ASSESSMENT_QUESTIONS;
  const resultData = resultDataProp || MOCK_ASSESSMENT_RESULTS;
  const totalQuestions = questions.length;
  const { mandatory: feedbackMandatory } = getCourseFeedbackConfig(courseId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  const currentQuestion = questions[currentIndex];

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

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const hasAnswered = answers[currentQuestion?.id] !== undefined;

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleNext = () => {
    if (!hasAnswered) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!hasAnswered) return;
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);
  };

  const handleTryAgain = () => {
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(30 * 60);
    setSubmitted(false);
    setScore(0);
  };

  const handleBackToCourses = () => {
    if (onExit) onExit();
  };

  const handleFeedbackSubmit = (formData) => {
    setFeedbackSubmitted(true);
    setShowFeedbackForm(false);
    setShowFeedbackSuccess(true);
    // TODO: send formData to backend when API is ready
    setTimeout(() => router.push("/courses"), 5000);
  };

  // Success message after feedback submit, then redirect to courses
  if (showFeedbackSuccess) {
    return (
      <LayoutShell>
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
              Redirecting you to courses...
            </p>
          </div>
        </PageContainer>
      </LayoutShell>
    );
  }

  // When user is on feedback screen, show full layout with sidebar
  if (submitted && showFeedbackForm) {
    return (
      <LayoutShell>
        <PageContainer className="py-8">
          <FeedbackForm
            onCancel={() => setShowFeedbackForm(false)}
            onSubmit={handleFeedbackSubmit}
          />
        </PageContainer>
      </LayoutShell>
    );
  }

  // Show result screen after submission (before / after feedback)
  if (submitted) {
    const passed = score >= resultData.passingScore;
    return (
      <ResultScreen
        passed={passed}
        score={score}
        resultData={resultData}
        onBackToCourses={handleBackToCourses}
        onTryAgain={handleTryAgain}
        feedbackMandatory={feedbackMandatory}
        feedbackSubmitted={feedbackSubmitted}
        onOpenFeedback={() => setShowFeedbackForm(true)}
      />
    );
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
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

          <div className="h-[330px]">
            <h2 className="text-base font-medium text-gray-900 mb-6">
              {currentQuestion.question_text || currentQuestion.question}
            </h2>

            <div className="flex flex-col">
              {(currentQuestion.options || currentQuestion.choices || []).map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                // Support object or string option
                let label = '';
                if (typeof option === 'object' && option !== null) {
                  label = option.option_label || option.text || option.label || '';
                } else {
                  label = option;
                }
                return (
                  <label
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="flex items-center gap-3 p-4 cursor-pointer rounded-xl border border-gray-100 hover:bg-gray-50 mb-4 shadow-sm"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        isSelected ? "border-primary" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="text-xs text-gray-700">{label}</span>
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
            disabled={!hasAnswered}
            className={`flex items-center gap-1.5 px-7 py-2.5 rounded-full text-sm font-semibold transition ${
              hasAnswered
                ? "bg-primary text-white hover:bg-primary/90 cursor-pointer"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}
          >
            {isLastQuestion ? "Submit" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

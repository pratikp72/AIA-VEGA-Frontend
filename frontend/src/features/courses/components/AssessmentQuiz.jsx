"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { COLORS } from "@/lib/constants";
import {
  MOCK_ASSESSMENT_QUESTIONS,
  MOCK_ASSESSMENT_RESULTS,
} from "@/services/mockData";

function ResultScreen({ passed, score, resultData, onBackToCourses, onTryAgain }) {
  if (passed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: COLORS.GRAY_BG }}>
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-[591px] p-4 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12" style={{ color: COLORS.SUCCESS_GREEN }} />
          </div>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: COLORS.SUCCESS_GREEN }}>
            {resultData.pass.title} {score}%
          </h2>
          <p className="font-semibold leading-relaxed mb-4" style={{ color: COLORS.BLACK_OPACITY }}>
            {resultData.pass.message}
          </p>
          <p className="text-xs font-semibold leading-relaxed mb-8" style={{ color: COLORS.BLACK_OPACITY }}>
            {resultData.pass.subMessage}
          </p>
          <button
            onClick={onBackToCourses}
            className="w-full py-3 rounded-xl text-white transition cursor-pointer"
            style={{ backgroundColor: COLORS.SUCCESS_GREEN }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.SUCCESS_GREEN_DARK}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.SUCCESS_GREEN}
          >
            {resultData.pass.buttonText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: COLORS.GRAY_BG }}>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[591px] p-10 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-12 h-12" style={{ color: COLORS.ERROR }} />
        </div>
        <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.ERROR }}>
          {resultData.fail.title} {score}%
        </h2>
        <p className="text-sm font-medium leading-relaxed mb-4" style={{ color: COLORS.ERROR }}>
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
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToCourses}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            {resultData.fail.secondaryButtonText}
          </button>
          <button
            onClick={onTryAgain}
            className="flex-1 py-3 rounded-xl border font-semibold transition cursor-pointer"
            style={{ 
              backgroundColor: COLORS.ERROR_LIGHT_BG,
              borderColor: COLORS.ERROR,
              color: COLORS.ERROR
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.ERROR_LIGHTER_BG}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.ERROR_LIGHT_BG}
          >
            {resultData.fail.primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentQuiz({ onExit }) {
  const questions = MOCK_ASSESSMENT_QUESTIONS;
  const resultData = MOCK_ASSESSMENT_RESULTS;
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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

  // Show result screen after submission
  if (submitted) {
    const passed = score >= resultData.passingScore;
    return (
      <ResultScreen
        passed={passed}
        score={score}
        resultData={resultData}
        onBackToCourses={handleBackToCourses}
        onTryAgain={handleTryAgain}
      />
    );
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: COLORS.GRAY_BG }}>
      {/* Top Bar — floating card */}
      <div className="px-6 pt-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2" style={{ color: COLORS.PRIMARY }}>
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
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%`, backgroundColor: COLORS.PRIMARY }}
            />
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-start justify-center pt-8 pb-6 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-3xl p-4">
          <div className="text-center mb-4">
            <span style={{ color: COLORS.PRIMARY }}>
              Question {currentIndex + 1}
            </span>
          </div>

          <div className="h-[330px]">
            <h2 className="text-base font-medium text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="flex flex-col">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                return (
                  <label
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="flex items-center gap-3 p-4 cursor-pointer rounded-xl border border-gray-100 hover:bg-gray-50 mb-4 shadow-sm"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        isSelected ? "" : "border-gray-300"
                      }`}
                      style={isSelected ? { borderColor: COLORS.PRIMARY } : {}}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.PRIMARY }} />
                      )}
                    </span>
                    <span className="text-xs text-gray-700">{option}</span>
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
                : "text-white"
            }`}
            style={currentIndex !== 0 ? { backgroundColor: COLORS.PRIMARY } : {}}
            onMouseEnter={(e) => currentIndex !== 0 && (e.currentTarget.style.backgroundColor = COLORS.PRIMARY_DARK)}
            onMouseLeave={(e) => currentIndex !== 0 && (e.currentTarget.style.backgroundColor = COLORS.PRIMARY)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={!hasAnswered}
            className={`flex items-center gap-1.5 px-7 py-2.5 rounded-full text-sm font-semibold transition ${
              hasAnswered
                ? "text-white cursor-pointer"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}
            style={hasAnswered ? { backgroundColor: COLORS.PRIMARY } : {}}
            onMouseEnter={(e) => hasAnswered && (e.currentTarget.style.backgroundColor = COLORS.PRIMARY_DARK)}
            onMouseLeave={(e) => hasAnswered && (e.currentTarget.style.backgroundColor = COLORS.PRIMARY)}
          >
            {isLastQuestion ? "Submit" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

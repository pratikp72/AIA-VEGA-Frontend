"use client";
import React, { useState } from "react";
import { Star } from "lucide-react";
import { apiService } from '@/services/api';

// Fallback questions used when no API feedback questions are available
const FALLBACK_QUESTIONS = [
  {
    question_id: "objectives",
    qestion: "Did you clearly understand the learning objectives of this course?",
    answer_type: "YesNo",
    mandatory: true,
  },
  {
    question_id: "relevant",
    qestion: "Was the course content relevant to your role?",
    answer_type: "YesNo",
    mandatory: true,
  },
  {
    question_id: "quality",
    qestion: "How would you rate the quality of the course content?",
    answer_type: "AgreeOrDisagree",
    mandatory: true,
  },
];

const ANSWER_TYPE_OPTIONS = {
  YesNo: ["Yes", "No"],
  AgreeOrDisagree: ["Agree", "Disagree"],
};

function RadioGroup({ questionId, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSelected ? "border-primary bg-primary" : "border-gray-300 bg-white"
              }`}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <input
              type="radio"
              name={questionId}
              value={opt}
              checked={isSelected}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            <span className="text-sm text-gray-900">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 focus:outline-none focus:ring-0"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className="w-8 h-8 transition-colors"
            fill={value >= star ? "#EAB308" : "transparent"}
            stroke={value >= star ? "#EAB308" : "#D1D5DB"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackForm({ questions, onCancel, onSubmit, userId, courseId }) {
  const activeQuestions =
    Array.isArray(questions) && questions.length > 0 ? questions : FALLBACK_QUESTIONS;

  const [answers, setAnswers] = useState({});
  const [courseRating, setCourseRating] = useState(0);
  const [additionalFeedback, setAdditionalFeedback] = useState("");

  const setAnswer = (questionId, value) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare answers for backend
    const payload = {
      data: {
        answers: {
          ...answers,
          courseRating,
          additionalFeedback,
        },
        course: courseId,
        users_permissions_user: userId,
      },
    };
    console.log('Submitting feedback payload:', payload);
    try {
      const response = await apiService.post('/feedback-submission/submit', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      // Optionally call onSubmit with response
      onSubmit?.(response);
      alert(response.message || 'Feedback submitted successfully!');
    } catch (error) {
      alert(error?.message || 'Failed to submit feedback.');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-[#fafafa]"
        style={{
          backgroundImage: "url(/feedback-form-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="w-full min-h-screen py-10 px-4 relative">
        <div className="relative w-full max-w-[947px] mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/80">
          <form onSubmit={handleSubmit} className="p-6 sm:p-10">

            {activeQuestions.map((q) => {
              const qid = q.question_id;
              const label = q.qestion || q.question || "";

              if (q.answer_type === "Rating") {
                return (
                  <div key={qid} className="mb-6">
                    <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">{label}</p>
                    <StarRating
                      value={answers[qid] || 0}
                      onChange={(v) => setAnswer(qid, v)}
                    />
                  </div>
                );
              }

              if (q.answer_type === "Text") {
                return (
                  <div key={qid} className="mb-6">
                    <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">{label}</p>
                    <textarea
                      value={answers[qid] || ""}
                      onChange={(e) => setAnswer(qid, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                  </div>
                );
              }

              // YesNo or AgreeOrDisagree
              const options = ANSWER_TYPE_OPTIONS[q.answer_type] || ["Yes", "No"];
              return (
                <div key={qid} className="mb-6">
                  <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">{label}</p>
                  <RadioGroup
                    questionId={qid}
                    options={options}
                    value={answers[qid]}
                    onChange={(v) => setAnswer(qid, v)}
                  />
                </div>
              );
            })}

            {/* Course rating */}
            <div className="mb-6">
              <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">Course rating</p>
              <StarRating value={courseRating} onChange={setCourseRating} />
            </div>

            {/* Additional feedback */}
            <div className="mb-8">
              <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">Additional feedback</p>
              <textarea
                value={additionalFeedback}
                onChange={(e) => setAdditionalFeedback(e.target.value)}
                placeholder="If you have more to add, please type it here..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-start gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border-2 border-primary bg-white text-primary font-semibold text-sm hover:bg-primary/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition"
              >
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

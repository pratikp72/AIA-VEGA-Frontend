"use client";
import React, { useState } from "react";
import { Star } from "lucide-react";

const FEEDBACK_QUESTIONS = [
  {
    id: "objectives",
    question: "Did you clearly understand the learning objectives of this course?",
    options: ["Yes", "No"],
  },
  {
    id: "relevant",
    question: "Was the course content relevant to your role?",
    options: ["Yes", "No"],
  },
  {
    id: "quality",
    question: "How would you rate the quality of the course content?",
    options: ["Excellent", "Good", "Average", "Poor"],
  },
];

export default function FeedbackForm({ onCancel, onSubmit }) {
  const [formData, setFormData] = useState({
    objectives: null,
    relevant: null,
    quality: null,
    courseRating: 0,
    additionalFeedback: "",
  });

  const handleRadioChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStarClick = (rating) => {
    setFormData((prev) => ({ ...prev, courseRating: rating }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <>
      {/* Full-viewport background so sidebar/topbar don't clip the image */}
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
          {FEEDBACK_QUESTIONS.map((q) => (
            <div key={q.id} className="mb-6">
              <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">
                {q.question}
              </p>
              <div className="flex flex-wrap gap-4">
                {q.options.map((opt) => {
                  const value = opt.toLowerCase();
                  const isSelected =
                    formData[q.id]?.toLowerCase() === value ||
                    formData[q.id] === opt;
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleRadioChange(q.id, opt)}
                        className="sr-only"
                      />
                      <span className="text-sm text-gray-900">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Course rating - stars */}
          <div className="mb-6">
            <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">
              Course rating
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  className="p-0.5 focus:outline-none focus:ring-0"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className="w-8 h-8 transition-colors"
                    fill={
                      formData.courseRating >= star
                        ? "#EAB308"
                        : "transparent"
                    }
                    stroke={
                      formData.courseRating >= star ? "#EAB308" : "#D1D5DB"
                    }
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Additional feedback */}
          <div className="mb-8">
            <p className="text-[15px] font-medium text-[#2d2a6e] mb-3">
              Additional feedback
            </p>
            <textarea
              value={formData.additionalFeedback}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  additionalFeedback: e.target.value,
                }))
              }
              placeholder="If you have more to add, please type it here..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Actions */}
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

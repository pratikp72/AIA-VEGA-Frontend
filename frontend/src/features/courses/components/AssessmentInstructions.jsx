"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";

import {
  Info,
  Timer,
  HelpCircle,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Wifi,
  ArrowRight,
} from "lucide-react";
import {
  MOCK_COURSES_CATEGORY_LIST,
  MOCK_ASSESSMENT_DATA,
} from "@/services/mockData";
import AssessmentQuiz from "./AssessmentQuiz";
import { getLatestSubmission, checkPendingReattemptRequest } from "../quizSubmissionAPI";
import { getCurrentUserId } from "@/lib/auth";

const ICON_MAP = {
  Timer,
  HelpCircle,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Wifi,
};

export default function AssessmentInstructions(props) {
  const router = useRouter();
  // Debug: log the received quiz prop
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("AssessmentInstructions quiz prop:", props.quiz);
  }
  const [category, setCategory] = useState(props.category || "");
  const [courseId, setCourseId] = useState(props.courseId || "");
  const [courseName, setCourseName] = useState(props.courseName || "");
  const [quizStarted, setQuizStarted] = useState(false);
  const [blockStartPendingReattempt, setBlockStartPendingReattempt] = useState(false);
  const [blockCheckLoading, setBlockCheckLoading] = useState(true);

const { subtitle, notice, instructionCards: mockInstructionCards, checklist: mockChecklist, buttonText } =
  MOCK_ASSESSMENT_DATA;

  // Build instruction cards: prefer API quiz_instruction, fall back to mock
  const apiInstructions = props.quiz?.quiz_instruction;
  const instructionCards =
    Array.isArray(apiInstructions) && apiInstructions.length > 0
      ? apiInstructions.map((instr, idx) => ({
          title: instr.name,
          description: instr.description,
          icon: instr.icon,
        }))
      : mockInstructionCards && mockInstructionCards.length > 0
        ? mockInstructionCards
        : [
            {
              title: "No instructions available",
              description: "No assessment instructions found for this course.",
              icon: "HelpCircle",
            },
          ];

  const apiChecklist = props.quiz?.quiz_instruction_checklist;
  const checklist =
    Array.isArray(apiChecklist) && apiChecklist.length > 0
      ? {
          subtitle: mockChecklist?.subtitle || "",
          items: apiChecklist.map((item) => item.discription), // note: Strapi has typo "discription"
        }
      : mockChecklist;

  useEffect(() => {
    let _category = props.category;
    let _courseId = props.courseId;
    if (!props.category || !props.courseId) {
      if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/");
        if (pathParts.length >= 5) {
          _category = pathParts[2];
          _courseId = pathParts[3];
          setCategory(_category);
          setCourseId(_courseId);
        }
      }
    }
    if (props.courseName) {
      setCourseName(props.courseName);
    } else if (_category && _courseId) {
      const courses = MOCK_COURSES_CATEGORY_LIST[_category] || [];
      const courseObj = courses.find((c) => String(c.id) === String(_courseId));
      setCourseName(courseObj ? courseObj.title : _courseId);
    }
  }, [props.category, props.courseId, props.courseName]);

  // Check if user has pending reattempt request (at max attempts) → block starting assessment
  useEffect(() => {
    const userId = props.userId ?? getCurrentUserId();
    const courseNumericId = props.courseNumericId;
    if (!courseNumericId || !userId) {
      setBlockCheckLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [latestRes, hasPending] = await Promise.all([
          getLatestSubmission(Number(userId), Number(courseNumericId)),
          checkPendingReattemptRequest(Number(userId), Number(courseNumericId)),
        ]);
        if (cancelled) return;
        const maxAttempt = latestRes?.maxAttempt ?? 1;
        const attemptNumber = latestRes?.submission?.attempt_number ?? 0;
        const atMaxAttempts = attemptNumber >= maxAttempt;
        setBlockStartPendingReattempt(atMaxAttempts && hasPending);
      } catch {
        if (!cancelled) setBlockStartPendingReattempt(false);
      } finally {
        if (!cancelled) setBlockCheckLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [props.userId, props.courseNumericId]);

  // Prepare quiz questions and result data for AssessmentQuiz
  // Support both quiz_questions (from API) and questions (legacy/mock)
  let quizQuestions = undefined;
  if (
    Array.isArray(props.quiz?.quiz_questions) &&
    props.quiz.quiz_questions.length > 0
  ) {
    quizQuestions = props.quiz.quiz_questions;
  } else if (
    Array.isArray(props.quiz?.questions) &&
    props.quiz.questions.length > 0
  ) {
    quizQuestions = props.quiz.questions;
  }
  const resultData = props.quiz?.resultData; // optional, fallback to mock in AssessmentQuiz

  // Pick feedback questions matching the quiz language, fall back to first entry
  const feedbackForLang =
    (props.feedback || []).find(fb => fb.language === props.quiz?.language) ||
    (props.feedback || [])[0];
  const feedbackQuestions = feedbackForLang?.feedback_question || [];
  // compulsory is a yes-no-toggle custom field: true = mandatory, false/null = optional
  const feedbackCompulsory = feedbackForLang?.compulsory === true;

  if (quizStarted) {
    return (
      <AssessmentQuiz
        onExit={() => setQuizStarted(false)}
        courseId={courseId}
        category={category}
        courseNumericId={props.courseNumericId}
        userId={props.userId ?? getCurrentUserId()}
        quizQuestions={quizQuestions}
        resultData={resultData}
        feedbackQuestions={feedbackQuestions}
        feedbackCompulsory={feedbackCompulsory}
      />
    );
  }

  const courseBgStyle = {
    backgroundImage: "url(/course-page-bg.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={courseBgStyle}>
      <div className="w-full">
        <PageHeader
          title="Assessment Instructions"
          breadcrumbs={[
            { label: "Courses", href: "/courses" },
            {
              label: category
                ? category
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                : "",
              href: `/courses/${category || ""}`,
            },
            {
              label: courseName
                ? courseName.length > 20
                  ? courseName.slice(0, 20) + "..."
                  : courseName
                : "",
              href: `/courses/${category || ""}/${courseId || ""}`,
            },
            { label: "Assessment" },
          ]}
          showBreadcrumbSeparator
          containerClassName="pt-xl pb-0 px-xl bg-transparent"
        />

        <div className="px-xl pb-xl">
          <p className="text-muted-foreground mb-6">{subtitle}</p>

          {/* Important Notice */}
          <div className="rounded-xl p-5 mb-8 flex items-start gap-3 border border-warning bg-orange-light">
            <div className="p-1.5 rounded-lg shrink-0 mt-0.5 bg-warning-light-bg">
              <Info className="w-4 h-4 text-warning" />
            </div>
            <div>
              <span className="font-semibold text-xl text-warning">
                {notice.title}
              </span>
              <p className="text-gray mt-1">{notice.description}</p>
            </div>
          </div>

          {/* Instructions Grid — 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {instructionCards.map((card, idx) => {
              let iconElement = null;
              if (
                card.icon &&
                typeof card.icon === "object" &&
                card.icon.iconData
              ) {
                // Render SVG from API
                iconElement = (
                  <svg
                    width={card.icon.width}
                    height={card.icon.height}
                    viewBox={`0 0 ${card.icon.width} ${card.icon.height}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label={card.icon.iconName}
                    dangerouslySetInnerHTML={{ __html: card.icon.iconData }}
                  />
                );
              } else if (
                card.icon &&
                typeof card.icon === "string" &&
                ICON_MAP[card.icon]
              ) {
                // Render default icon from ICON_MAP
                const IconComp = ICON_MAP[card.icon];
                iconElement = (
                  <IconComp className="w-4 h-4 text-primary-purple" />
                );
              }
              return (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-2.5"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5 bg-primary-light">
                    {iconElement}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-dark text-xl">
                      {card.title}
                    </span>
                    <p className="text-base text-gray leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pre-Assessment Checklist */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Pre-Assessment Checklist
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              {checklist.subtitle && (
                <p className="mb-4">{checklist.subtitle}</p>
              )}
              <ul className="flex flex-col gap-3">
                {checklist.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <ArrowRight className="w-4 h-4 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Start Assessment Button / Pending Reattempt Block */}
          <div className="flex flex-col items-center gap-4">
            {blockStartPendingReattempt ? (
              <>
                <div className="rounded-xl p-5 mb-2 flex items-start gap-3 border border-warning bg-orange-light max-w-xl w-full">
                  <div className="p-1.5 rounded-lg shrink-0 mt-0.5 bg-warning-light-bg">
                    <Info className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-warning">
                      Re-attempt request pending
                    </span>
                    <p className="text-gray mt-1">
                      Your re-attempt request has been sent. Please wait for admin approval before you can take the assessment again.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/courses")}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-10 rounded-xl shadow transition cursor-pointer"
                >
                  Back to Courses
                </button>
              </>
            ) : (
              <button
                onClick={() => setQuizStarted(true)}
                disabled={blockCheckLoading}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-10 rounded-xl shadow transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {blockCheckLoading ? "Checking..." : buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

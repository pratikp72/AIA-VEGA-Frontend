"use client";
import React, { useEffect, useState } from "react";
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

const ICON_MAP = {
  Timer,
  HelpCircle,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Wifi,
};

export default function AssessmentInstructions(props) {
  const [category, setCategory] = useState(props.category || "");
  const [courseId, setCourseId] = useState(props.courseId || "");
  const [courseName, setCourseName] = useState(props.courseName || "");
  const [quizStarted, setQuizStarted] = useState(false);


  const { subtitle, notice, instructionCards: mockInstructionCards, checklist: mockChecklist, buttonText } =
    MOCK_ASSESSMENT_DATA;

  // Build instruction cards: prefer API quiz_instruction, fall back to mock
  const apiInstructions = props.quiz?.quiz_instruction;
  const instructionCards = Array.isArray(apiInstructions) && apiInstructions.length > 0
    ? apiInstructions.map((instr, idx) => ({
        title: instr.name,
        description: instr.description,
        icon: instr.icon,
      }))
    : mockInstructionCards;

  // Build checklist: prefer API quiz_instruction_checklist, fall back to mock
  const apiChecklist = props.quiz?.quiz_instruction_checklist;
  const checklist = Array.isArray(apiChecklist) && apiChecklist.length > 0
    ? {
        title: 'Checklist',
        subtitle: '',
        items: apiChecklist.map(item => item.discription || item.description || ''),
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

  if (quizStarted) {
    return (
      <AssessmentQuiz
        onExit={() => setQuizStarted(false)}
        courseId={courseId}
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
              if (card.icon && typeof card.icon === 'object' && card.icon.iconData) {
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
              } else if (card.icon && typeof card.icon === 'string' && ICON_MAP[card.icon]) {
                // Render default icon from ICON_MAP
                const IconComp = ICON_MAP[card.icon];
                iconElement = <IconComp className="w-4 h-4 text-primary-purple" />;
              }
              return (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-2.5"
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5 bg-primary-light"
                  >
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
              {checklist.subtitle && <p className="mb-4">{checklist.subtitle}</p>}
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

          {/* Start Assessment Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setQuizStarted(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-10 rounded-xl shadow transition cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

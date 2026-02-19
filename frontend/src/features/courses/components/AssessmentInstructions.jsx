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
  const [courseName, setCourseName] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);

  const { subtitle, notice, instructionCards, checklist, buttonText } =
    MOCK_ASSESSMENT_DATA;

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
    if (_category && _courseId) {
      const courses = MOCK_COURSES_CATEGORY_LIST[_category] || [];
      const courseObj = courses.find((c) => String(c.id) === String(_courseId));
      setCourseName(courseObj ? courseObj.title : _courseId);
    }
  }, [props.category, props.courseId]);

  if (quizStarted) {
    return <AssessmentQuiz onExit={() => setQuizStarted(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
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
          containerClassName="pt-xl pb-0 px-xl"
        />

        <div className="px-xl pb-xl">
          <p className="text-gray-500 mb-6">{subtitle}</p>

          {/* Important Notice */}
          <div className="bg-[#FFF8EB] border border-[#FD8C02] rounded-xl p-5 mb-8 flex items-start gap-3">
            <div className="bg-[#F7E4C1] p-1.5 rounded-lg shrink-0 mt-0.5">
              <Info className="w-4 h-4" color="#FD8C02" />
            </div>
            <div>
              <span className="font-semibold text-[#FD8C02] text-xl">
                {notice.title}
              </span>
              <p className="text-gray-500 mt-1">{notice.description}</p>
            </div>
          </div>

          {/* Instructions Grid — 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {instructionCards.map((card, idx) => {
              const IconComp = ICON_MAP[card.icon];
              return (
                <div
                  key={idx}
                  className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-5 flex items-start gap-2.5"
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: card.iconBg }}
                  >
                    {IconComp && (
                      <IconComp className="w-4 h-4" color={card.iconColor} />
                    )}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900 text-xl">
                      {card.title}
                    </span>
                    <p className="text-base text-gray-500 leading-relaxed">
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
              {checklist.title}
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="mb-4">{checklist.subtitle}</p>
              <ul className="flex flex-col gap-3">
                {checklist.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <ArrowRight className="w-4 h-4 shrink-0" />
                    <span className="">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Start Assessment Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setQuizStarted(true)}
              className="bg-[#9C2EDB] hover:bg-[#8a28c5] text-white font-semibold py-3 px-10 rounded-xl shadow transition cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { User, Clock, AlarmClock } from "lucide-react";

export default function CourseStats({ course, progressPercentage = 0, quizScore, totalModuleTimeMin = 0 }) {
  if (!course) return null;

  const minPassingScore = course.minPassingScore ?? course.min_passing_score ?? 0;

  const timeLabel = totalModuleTimeMin >= 60
    ? `${Math.floor(totalModuleTimeMin / 60)} hr${Math.floor(totalModuleTimeMin / 60) !== 1 ? 's' : ''}${totalModuleTimeMin % 60 > 0 ? ` ${totalModuleTimeMin % 60} mins` : ''}`
    : `${totalModuleTimeMin} mins`;

  const stats = [
    {
      icon: <User className="w-4 h-4 text-white" />,
      iconBg: 'bg-primary',
      label: 'Course Completed',
      value: `${Math.min(100, progressPercentage)}%`,
    },
    {
      icon: <Clock className="w-4 h-4 text-white" />,
      iconBg: 'bg-success',
      label: 'Time',
      value: timeLabel,
    },
    {
      icon: <AlarmClock className="w-4 h-4 text-white" />,
      iconBg: 'bg-orange',
      label: 'Min. Passing Score',
      value: `${minPassingScore}%`,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Statistics card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="text-xl font-bold text-gray-900 mb-4">Statistics</p>
        <div className="flex flex-col">
          {stats.map(({ icon, iconBg, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-[10px] first:pt-0 last:pb-0">
              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${iconBg}`}>
                {icon}
              </span>
              <span className="flex-1 text-sm font-medium text-gray-400">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Score row */}
      {quizScore != null && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Test Score (%)</span>
          <span className="text-sm font-semibold text-gray-900">{quizScore}%</span>
        </div>
      )}
    </div>
  );
}

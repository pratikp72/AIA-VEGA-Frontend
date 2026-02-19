
import React from "react";
import { User, CheckCircle2, AlarmClock } from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { COLORS } from "@/lib/constants";
export default function CourseStats({ course }) {
  if (!course) return null;
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 relative">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xl font-bold text-gray-900">Statistics</span>
        <span className="text-xs text-gray-400 mt-1">January - June 2021</span>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full" style={{ backgroundColor: COLORS.PRIMARY_OPACITY_10 }}>
              <User className="w-5 h-5" color={COLORS.PRIMARY} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">Modules Completed</span>
              <span className="text-base font-bold text-gray-900">{course.progress}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full" style={{ backgroundColor: COLORS.INFO_TEAL_OPACITY }}>
              <CheckCircle2 className="w-5 h-5" color={COLORS.INFO_TEAL} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">Tasks & Exam</span>
              <span className="text-base font-bold text-gray-900">70%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full" style={{ backgroundColor: COLORS.ORANGE_OPACITY }}>
              <AlarmClock className="w-5 h-5" color={COLORS.ORANGE} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">Time</span>
              <span className="text-base font-bold text-gray-900">2 hours 50 mins</span>
            </div>
          </div>
        </div>
        {/* Circular Progress */}
        <div className="relative shrink-0 w-[142px] max-w-[40%] aspect-square">
          <CircularProgressbar
            value={course.progress}
            strokeWidth={8}
            styles={buildStyles({
              pathColor: COLORS.SUCCESS_LIGHT,
              trailColor: COLORS.BLUE_LIGHT,
              pathTransitionDuration: 0.5,
              strokeLinecap: 'round',
            })}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold leading-tight" style={{ color: COLORS.SUCCESS_LIGHT }}>{course.progress}%</span>
            <span className="text-[11px] text-gray-400 leading-tight">Grades Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

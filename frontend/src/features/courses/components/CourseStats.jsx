
import React from "react";
import { User, CheckCircle2, AlarmClock } from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">Modules Completed</span>
              <span className="text-base font-bold text-gray-900">{course.progress}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-teal/10">
              <CheckCircle2 className="w-5 h-5 text-teal" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">Tasks & Exam</span>
              <span className="text-base font-bold text-gray-900">70%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-warning-light">
              <AlarmClock className="w-5 h-5 text-warning" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">Time</span>
              <span className="text-base font-bold text-gray-900">2 hours 50 mins</span>
            </div>
          </div>
        </div>
        {/* Circular Progress */}
        <div className="relative shrink-0 w-36 max-w-[40%] aspect-square">
          <CircularProgressbar
            value={course.progress}
            strokeWidth={8}
            styles={buildStyles({
              pathColor: 'var(--color-success)',
              trailColor: 'var(--color-primary-light)',
              pathTransitionDuration: 0.5,
              strokeLinecap: 'round',
            })}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold leading-tight text-success">{course.progress}%</span>
            <span className="text-[11px] text-gray-400 leading-tight">Grades Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

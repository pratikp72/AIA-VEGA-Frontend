import React from "react";
import { Lock } from "lucide-react";

export default function FinalAssessment() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <div className="font-semibold text-gray-800 text-lg mb-4">Final Assessment</div>
      <div className="flex justify-center">
        <div className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl flex flex-col items-center p-4 shadow-sm">
          <Lock className="w-6 h-6 text-gray-400 mb-2" />
          <span className="text-base text-gray-400 font-medium text-center">
            Complete all modules to unlock the assessment
          </span>
        </div>
      </div>
    </div>
  );
}

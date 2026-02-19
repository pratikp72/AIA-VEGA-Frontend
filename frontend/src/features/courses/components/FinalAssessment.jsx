import React from "react";
import { Lock } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function FinalAssessment({ unlocked, category, courseId }) {
  const router = useRouter();
  if (!unlocked) {
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
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <div className="font-semibold text-gray-800 text-lg mb-4">Final Assessment</div>
      <div className="flex justify-center">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-150 text-lg"
          onClick={() => router.push(`/courses/${category}/${courseId}/assessment`)}
        >
          Go to Assessment
        </button>
      </div>
    </div>
  );
}

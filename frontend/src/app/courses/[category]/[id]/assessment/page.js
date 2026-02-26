"use client";
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import AssessmentInstructions from '@/features/courses/components/AssessmentInstructions';
import Loader from '@/components/common/Loader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadCourseById, clearCurrentCourse } from '@/features/courses/coursesSlice';
import {
  selectCurrentCourse,
  selectCourseDetailLoading,
} from '@/features/courses/coursesSelectors';

export default function AssessmentInstructionsRoutePage() {
  const params = useParams();
  const { category, id } = params;

  const dispatch = useAppDispatch();
  const course = useAppSelector(selectCurrentCourse);
  const isLoading = useAppSelector(selectCourseDetailLoading);

  useEffect(() => {
    if (id) {
      dispatch(loadCourseById(id));
    }
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Map instructions from the quiz object to quiz_instruction for compatibility
  let quiz = course?.quiz?.[0] || null;
  
  return (
    <AssessmentInstructions
      category={category}
      courseId={id}
      courseName={course?.title}
      quiz={quiz}
    />
  );
}

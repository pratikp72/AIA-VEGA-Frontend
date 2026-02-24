"use client";
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import CoursesDetailPage from '@/features/courses/components/CoursesDetailPage';
import Loader from '@/components/common/Loader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadCourseById, clearCurrentCourse } from '@/features/courses/coursesSlice';
import {
  selectCurrentCourse,
  selectCourseDetailLoading,
  selectCourseDetailError,
} from '@/features/courses/coursesSelectors';

export default function CourseDetailModulePage() {
  const params = useParams();
  const { category, id, moduleId } = params;

  const dispatch = useAppDispatch();
  const course = useAppSelector(selectCurrentCourse);
  const isLoading = useAppSelector(selectCourseDetailLoading);
  const error = useAppSelector(selectCourseDetailError);

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

  if (error) {
    return <div className="p-8 text-red-500">Failed to load course: {error}</div>;
  }

  if (!course) return <div className="p-8">Course not found.</div>;

  const modulesList = course.modulesList || [];
  const selectedModule = moduleId
    ? modulesList.find(m => String(m.id) === String(moduleId))
    : null;
  const defaultModule = selectedModule || modulesList[0];

  return <CoursesDetailPage category={category} course={course} selectedModule={defaultModule} />;
}

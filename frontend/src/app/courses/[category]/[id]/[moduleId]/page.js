"use client";
import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const { category, id, moduleId } = params;
  const urlLanguage = searchParams.get('lang') || searchParams.get('language') || '';

  const dispatch = useAppDispatch();
  const course = useAppSelector(selectCurrentCourse);
  const isLoading = useAppSelector(selectCourseDetailLoading);
  const error = useAppSelector(selectCourseDetailError);

  useEffect(() => {
    if (id) {
      if (urlLanguage) {
        dispatch(loadCourseById({ documentId: id, language: urlLanguage }));
      } else {
        dispatch(loadCourseById(id));
      }
    }
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, id, urlLanguage]);

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

  return (
    <CoursesDetailPage
      category={category}
      course={course}
      initialLanguage={urlLanguage || undefined}
    />
  );
}

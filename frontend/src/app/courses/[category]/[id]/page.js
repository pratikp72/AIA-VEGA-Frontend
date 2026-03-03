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

export default function CourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { category, id } = params;
  const moduleId = searchParams.get('moduleId');

  const dispatch = useAppDispatch();
  const course = useAppSelector(selectCurrentCourse);
  const isLoading = useAppSelector(selectCourseDetailLoading);
  const error = useAppSelector(selectCourseDetailError);

  const urlLanguage = searchParams.get('lang') || searchParams.get('language') || '';

  useEffect(() => {
    if (id) {
      if (urlLanguage) {
        // Only filter by language when URL explicitly provides it
        dispatch(loadCourseById({ documentId: id, language: urlLanguage }));
      } else {
        // No language param → let backend return all languages
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

  // Use normalized modulesList (normalizeModule maps modules → modulesList)
  const modules = Array.isArray(course.modulesList) ? course.modulesList : [];
  const selectedModule = moduleId
    ? modules.find(m => String(m.moduleId || m.id) === String(moduleId))
    : null;
  const defaultModule = selectedModule || modules[0];

  return (
    <CoursesDetailPage
      category={category}
      course={course}
      selectedModule={defaultModule}
      initialLanguage={urlLanguage || undefined}
    />
  );
}

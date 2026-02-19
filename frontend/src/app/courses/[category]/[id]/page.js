"use client";
import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MOCK_COURSES_CATEGORY_LIST, MOCK_COURSE_CONTENTS } from '@/services/mockData';
import CoursesDetailPage from '@/features/courses/components/CoursesDetailPage';
import CourseTextOrPdf from '@/features/courses/components/CourseTextOrPdf';

export default function CourseDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { category, id } = params;
  const moduleId = searchParams.get('moduleId');
  
  const courses = MOCK_COURSES_CATEGORY_LIST[category?.toLowerCase()] || [];
  const course = courses.find(c => String(c.id) === String(id));
  
  if (!course) return <div className="p-8">Course not found.</div>;
  
  let selectedModule = null;
  if (moduleId) {
    selectedModule = MOCK_COURSE_CONTENTS.find(m => String(m.id) === String(moduleId));
  }
  
  const defaultModule = selectedModule || MOCK_COURSE_CONTENTS[0];
  
  return <CoursesDetailPage category={category} course={course} selectedModule={defaultModule} />;
}

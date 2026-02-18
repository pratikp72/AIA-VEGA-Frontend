"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { MOCK_COURSES_CATEGORY_LIST } from '@/services/mockData';
import CoursesDetailPage from '@/features/courses/components/CoursesDetailPage';
import CourseTextOrPdf from '@/features/courses/components/CourseTextOrPdf';

export default function CourseDetailPage() {
  const params = useParams();
  const { category, id } = params;
  const courses = MOCK_COURSES_CATEGORY_LIST[category?.toLowerCase()] || [];
  const course = courses.find(c => String(c.id) === String(id));
  if (!course) return <div className="p-8">Course not found.</div>;
  if (course.contentType === 'video') {
    return <CoursesDetailPage category={category} course={course} />;
  }
  return <CourseTextOrPdf course={course} category={category} />;
}

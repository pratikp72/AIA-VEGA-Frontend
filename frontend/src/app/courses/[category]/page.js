"use client";
import { useParams } from 'next/navigation';
import CoursesCategoryPage from '@/features/courses/components/CoursesCategoryPage';

export default function CoursesCategoryRoutePage() {
  const params = useParams();
  const { category } = params;
  return <CoursesCategoryPage category={category} />;
}

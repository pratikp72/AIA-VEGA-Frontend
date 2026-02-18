"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { MOCK_COURSES_CATEGORY_LIST } from '@/services/mockData';
import { ChevronRight } from 'lucide-react';

export default function CourseDetailPage() {
  // Get category and id from params
  const params = useParams();
  const { category, id } = params;
  const courses = MOCK_COURSES_CATEGORY_LIST[category?.toLowerCase()] || [];
  const course = courses.find(c => String(c.id) === String(id));

  if (!course) return <div className="p-8">Course not found.</div>;

  // Only show video player if contentType is video
  return (
    <div className="min-h-screen bg-background px-10 py-8">
      <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">
        <span>Courses</span>
        <ChevronRight className="w-4 h-4" />
        <span className="capitalize">{category}</span>
        <ChevronRight className="w-4 h-4" />
        <span>{course.title}</span>
      </div>
      <h1 className="text-2xl font-bold mb-6">{course.title}</h1>
      {course.contentType === 'video' && (
        <div className="mb-8 rounded-xl overflow-hidden" style={{ maxWidth: 800 }}>
          {/* Replace with real video src in real app */}
          <video controls className="w-full h-96 bg-black rounded-xl">
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">1. Performance Optimization</h2>
        <div className="mb-2 text-base font-medium">Lectures Description</div>
        <p className="mb-4 text-gray-700">We cover everything you need to build your first website. From creating your first page through to uploading your website to the internet. Walk with the world’s most popular (and free) web design tool called Visual Studio Code. There are videos as you go, live processes to aid you and even compare your results with mine. This real analysis is to guide you so easily whilst you work through the problem. We also show you how to design and code your site so you are very much in control. We have brought material from my years of experience in web design and have never coded before. We’ll start right at the beginning and work our way up.</p>
        <div className="mb-2 text-base font-medium">Lecture Notes</div>
        <ul className="list-disc pl-6 text-gray-700 mb-4">
          <li>Aliquam efficitur enim cursus elit efficitur lacinia.</li>
          <li>Donec fermentum blandit.</li>
          <li>Morbi euismod ex quis elit feugiat.</li>
          <li>Donec placerat orci in egestas.</li>
        </ul>
        <p className="text-gray-700">Sed elementum, libero in lacinia aliquet, purus nibh consectetur mauris, eget tincidunt nisi risus vitae sem. Integer lobortis urna non laoreet posuere vehicula condimentum. Quisque quis lacus quam. Quam orci bibendum erat, nec non. Nam pharetra egestas varius. Sed aliquamcorper facilisis hendrerit.</p>
      </section>
    </div>
  );
}

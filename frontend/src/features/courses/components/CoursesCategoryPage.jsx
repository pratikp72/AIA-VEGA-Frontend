'use client';
import React from 'react';
import { useMemo } from 'react';
import PageSection from '@/components/common/PageSection';
import PageHeader from '@/components/common/PageHeader';
import SurfaceCard from '@/components/common/SurfaceCard';
import { MOCK_COURSES_CATEGORY_LIST } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, MoreVertical, ChevronRight, Clock, BookOpen, Users, Award } from 'lucide-react';
import Link from 'next/link';


const CATEGORY_LABELS = {
  mandatory: 'Mandatory Training',
  orientation: 'Orientation',
  all: 'Courses',
};

export default function CoursesCategoryPage({ category }) {
  // Filter mock data by category
  // Normalize category slug
  const normalized = (category || '').toLowerCase();
  const courses = useMemo(
    () => (MOCK_COURSES_CATEGORY_LIST[normalized] || []),
    [normalized]
  );
  const title = CATEGORY_LABELS[normalized] || 'Courses';

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Courses', href: '/courses' },
          { label: title },
        ]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-0 px-xl"
      >
        <p className="text-body text-muted-foreground">
          Explore and complete courses to grow your skills
        </p>
      </PageHeader>
      <main>
        <PageSection className="pt-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isNotStarted = !course.completed && (!course.progress || course.progress === 0);
              const isInProgress = !course.completed && course.progress > 0;
              const isCompleted = !!course.completed;
              const courseUrl = `/courses/${category}/${course.id}`;
              const cardContent = (
                <SurfaceCard key={course.id} className="flex flex-col h-full rounded-2xl p-0 overflow-hidden cursor-pointer">
                  <div className="relative w-full overflow-hidden pt-4 px-4" style={{ height: 220 }}>
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-[20px]"
                      style={{ borderRadius: '18px' }}
                    />
                    <div className="absolute top-6 left-6 flex items-center gap-2 w-full pr-4">
                      {course.completed && (
                        <Badge
                          className="inline-flex items-center justify-center rounded-md px-3 py-1 border border-transparent text-white"
                          style={{ background: 'rgba(156, 46, 219, 0.7)' }}
                        >
                          Completed
                        </Badge>
                      )}
                      {course.completed && course.certificationGenerated && (
                        <span className="absolute top-0 right-0 mr-12 bg-[#EFBF04] rounded-md p-1 shadow-md flex items-center">
                          <Award className="w-6 h-6" color='#ffffff' />
                        </span>
                      )}
                    </div>
                    {course.contentType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-white/80" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 px-4 pb-4 gap-2" style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 16 }}>
                    <div className="flex items-center gap-6 text-small text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration} hours
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.modules} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.learners}
                      </span>
                      <span className="flex-1" />
                      <MoreVertical className="text-muted-foreground w-5 h-5 cursor-pointer ml-auto" />
                    </div>
                    <div className="font-medium text-gray-900 text-lg line-clamp-2">
                      {course.title}
                    </div>
                    {isInProgress && (
                      <>
                        <div className="flex items-center justify-between mb-2 mt-2">
                          <span className="text-small font-semibold text-primary">{course.progress}% Completed</span>
                          <span className="text-small text-muted-foreground">{course.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-primary rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {isNotStarted && (
                      <Button className="bg-primary text-white rounded-md px-6 py-2 mt-4 flex items-center gap-2 w-full justify-center">
                        Start Course <ChevronRight className="w-5 h-5" />
                      </Button>
                    )}
                    {isCompleted && (
                      <div className="mt-6 flex">
                        <Button className="bg-primary text-white rounded-md px-6 py-2 w-full flex items-center gap-2 justify-center text-lg font-semibold">
                          Review <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </SurfaceCard>
              );

              // Wrap all cards in a Link so all types are clickable
              return (
                <Link key={course.id} href={courseUrl} style={{ textDecoration: 'none' }}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </PageSection>
      </main>
    </div>
  );
}

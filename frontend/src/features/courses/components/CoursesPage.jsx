'use client';

import { useEffect, useMemo } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import CourseCategoryCard from './CourseCategoryCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadAllCourses } from '@/features/courses/coursesSlice';
import {
  selectCoursesList,
  selectCoursesLoading,
  selectCoursesError,
} from '@/features/courses/coursesSelectors';

const CATEGORY_IMAGES = {
  Mandatory: '/course-page-bg.png',
  Orientation: '/course-page-bg.png',
  Other: '/course-page-bg.png',
};

const CATEGORY_DESCRIPTIONS = {
  Mandatory: 'Required training courses that every employee must complete.',
  Orientation: 'Onboarding and orientation programs for new employees.',
  Other: 'Additional courses to expand your knowledge and skills.',
};

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const coursesList = useAppSelector(selectCoursesList);
  const isLoading = useAppSelector(selectCoursesLoading);
  const error = useAppSelector(selectCoursesError);

  useEffect(() => {
    dispatch(loadAllCourses());
  }, [dispatch]);

  // Derive category groups from courses list
  const categoryGroups = useMemo(() => {
    const groups = {};
    coursesList.forEach(course => {
      const cat = course.category || 'Other';
      if (!groups[cat]) groups[cat] = { courses: [], totalDuration: 0 };
      groups[cat].courses.push(course);
      groups[cat].totalDuration += course.duration || 0;
    });
    return groups;
  }, [coursesList]);

  const courseBgStyle = {
    backgroundImage: 'url(/course-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={courseBgStyle}>
      <PageHeader
        title="Courses"
        breadcrumbs={[{ label: 'Courses' }]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      >
        <p className="text-body text-muted-foreground">
          Explore and complete courses to grow your skills.
        </p>
      </PageHeader>

      <main>
        <PageSection className="pt-md">
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">{error}</p>
            </div>
          ) : Object.keys(categoryGroups).length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">No courses available</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(categoryGroups).map(([category, group]) => {
                const totalHours = Math.round((group.totalDuration || 0) * 10) / 10;
                const slug = category.toLowerCase();
                return (
                  <CourseCategoryCard
                    key={category}
                    title={category}
                    description={CATEGORY_DESCRIPTIONS[category] || 'Explore courses in this category.'}
                    modules={group.courses.length}
                    hours={totalHours || '—'}
                    image={CATEGORY_IMAGES[category] || '/course-page-bg.png'}
                    href={`/courses/${slug}`}
                  />
                );
              })}
            </div>
          )}
        </PageSection>
      </main>
    </div>
  );
}

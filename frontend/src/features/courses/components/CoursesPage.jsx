'use client';

import { useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import Loader from '@/components/common/Loader';
import CourseCategoryCard from './CourseCategoryCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadCourseCategories } from '@/features/courses/coursesSlice';
import {
  selectCourseCategories,
  selectCoursesLoading,
  selectCoursesError,
} from '@/features/courses/coursesSelectors';

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCourseCategories);
  const isLoading = useAppSelector(selectCoursesLoading);
  const error = useAppSelector(selectCoursesError);

  useEffect(() => {
    dispatch(loadCourseCategories());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Courses"
        breadcrumbs={[{ label: 'Courses' }]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-0 px-xl"
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
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body text-muted-foreground">No courses available</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {categories.map((category) => {
                // Map display title to slug
                let slug = 'all';
                if (category.title.toLowerCase().includes('mandatory')) slug = 'mandatory';
                else if (category.title.toLowerCase().includes('orientation')) slug = 'orientation';
                // fallback is 'all'
                return (
                  <CourseCategoryCard
                    key={category.id}
                    title={category.title}
                    description={category.description}
                    modules={category.modules}
                    hours={category.hours}
                    image={category.image}
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

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function MyCourses({ courses = [] }) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h2">My Courses</h2>
        <Link
          href="/courses"
          className="text-body text-primary hover:underline font-medium"
        >
          View Courses →
        </Link>
      </div>

      <div className="flex flex-col items-start gap-6 h-[677px] flex-1 w-full">
        {courses.slice(0, 4).map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`} className="flex-1 min-h-0 flex w-full min-w-0">
            <Card className="w-full min-w-0 p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white rounded-[20px] h-[140px] flex flex-col min-h-0 overflow-visible justify-center items-start gap-4 self-stretch">
              <div className="flex gap-4 flex-1 min-h-0 min-w-0 w-full">
                {/* Course Thumbnail - fixed size, same for all */}
                <div className="w-60px h-60px flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Course Info - align top so title is not clipped */}
                <div className="flex-1 min-w-0 flex flex-col justify-start overflow-visible pt-0.5">
                  <h3 className="text-h3 font-semibold text-gray-900 line-clamp-2 break-words min-h-[2.5em] leading-normal">
                    {course.title}
                  </h3>
                  <p className="text-small text-muted-foreground mb-2">
                    {course.completedLessons} of {course.totalLessons} modules
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-small font-semibold text-gray-900 shrink-0">
                      {course.progress}%
                    </span>
                  </div>

                  <p className="text-small text-muted-foreground mt-1.5">
                    Due {new Date(course.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
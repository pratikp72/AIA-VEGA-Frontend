'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function MyCourses({ courses = [] }) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-gray-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Courses</h2>
        <Link
          href="/courses"
          className="text-sm text-primary hover:underline font-medium"
        >
          View Courses →
        </Link>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        {courses.slice(0, 3).map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`} className="flex-1 min-h-0 flex">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-200 bg-background rounded-xl shadow-sm flex-1 min-h-0 flex flex-col">
              <div className="flex gap-4 flex-1 min-h-0">
                {/* Course Thumbnail - Left Side */}
                <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Course Info - Right Side */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {course.completedLessons} of {course.totalLessons} modules
                  </p>

                  {/* Progress Section - full 100% bar visible, completed part purple */}
                  <div className="flex items-center gap-3 mb-1 mt-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-right shrink-0 mt-3">
                      {course.progress}%
                    </span>
                  </div>

                  {/* Due Date */}
                  <p className="text-xs text-muted-foreground mt-auto">
                    Due:{' '}
                    {new Date(course.deadline).toLocaleDateString('en-US', {
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
    </Card>
  );
}
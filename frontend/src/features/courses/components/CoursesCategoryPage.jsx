'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageSection from '@/components/common/PageSection';
import PageHeader from '@/components/common/PageHeader';
import SurfaceCard from '@/components/common/SurfaceCard';
import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, MoreVertical, ChevronRight, Clock, BookOpen, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadAllCourses } from '@/features/courses/coursesSlice';
import { selectCoursesList, selectCoursesLoading } from '@/features/courses/coursesSelectors';
import { fetchUserCourseProgress } from '@/features/courses/coursesAPI';
import { getLatestSubmission } from '../quizSubmissionAPI';
import { getCurrentUserId } from '@/lib/auth';

const CATEGORY_LABELS = {
  mandatory: 'Mandatory Training',
  orientation: 'Orientation',
  all: 'Courses',
};

export default function CoursesCategoryPage({ category }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const allCourses = useAppSelector(selectCoursesList);
  const isLoading = useAppSelector(selectCoursesLoading);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [feedbackEligibility, setFeedbackEligibility] = useState({});
  const [startBlockModal, setStartBlockModal] = useState({
    open: false,
    title: '',
    message: '',
    kind: 'block',
    courseUrl: '',
    prerequisites: [],
  });

  useEffect(() => {
    dispatch(loadAllCourses());
  }, [dispatch]);

  const normalized = (category || '').toLowerCase();
  const title = CATEGORY_LABELS[normalized] || 'Courses';

  const courses = useMemo(() => {
    if (!normalized || normalized === 'all') return allCourses;
    return allCourses.filter(
      c => (c.category || '').toLowerCase() === normalized
    );
  }, [allCourses, normalized]);

  const courseBgStyle = {
    backgroundImage: 'url(/course-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const handleFeedbackClick = async (event, course) => {
    event.preventDefault();
    event.stopPropagation();

    const userId = getCurrentUserId();
    if (!userId) {
      window.alert('Please log in to submit feedback.');
      return;
    }

    const courseNumericId = course.id ?? course.documentId;
    if (!courseNumericId) {
      window.alert('Unable to determine course. Please open the course detail page.');
      return;
    }

    try {
      const [progressInfo, latest] = await Promise.all([
        fetchUserCourseProgress(userId, courseNumericId, { fresh: true }),
        getLatestSubmission(userId, courseNumericId),
      ]);

      const progressStatus = progressInfo?.progressStatus;
      const passedQuiz = latest?.submission?.passed === true;
      const notCompleted = progressStatus !== 'Completed';

      if (passedQuiz && notCompleted) {
        setOpenMenuId(null);
        const feedbackUrl = `/courses/${category}/${course.documentId}?feedback=1`;
        window.location.href = feedbackUrl;
      } else {
        window.alert(
          'Feedback will be enabled only after you pass the assessment and before completing the course.'
        );
      }
    } catch (err) {
      console.error('Failed to check feedback eligibility:', err);
      window.alert('Could not verify feedback eligibility. Please open the course to continue.');
    }
  };

  const ensureFeedbackEligibility = async (course) => {
    const key = String(course.id ?? course.documentId ?? '');
    if (!key) return;

    const existing = feedbackEligibility[key];
    if (existing && (existing.loading || existing.checked)) return;

    const userId = getCurrentUserId();
    const courseNumericId = course.id ?? course.documentId;

    if (!userId) {
      setFeedbackEligibility((prev) => ({
        ...prev,
        [key]: {
          checked: true,
          loading: false,
          canSubmit: false,
          reason: 'Please log in to submit feedback.',
        },
      }));
      return;
    }

    if (!courseNumericId) {
      setFeedbackEligibility((prev) => ({
        ...prev,
        [key]: {
          checked: true,
          loading: false,
          canSubmit: false,
          reason: 'Course information is incomplete.',
        },
      }));
      return;
    }

    setFeedbackEligibility((prev) => ({
      ...prev,
      [key]: {
        checked: false,
        loading: true,
        canSubmit: false,
        reason: '',
      },
    }));

    try {
      const [progressInfo, latest] = await Promise.all([
        fetchUserCourseProgress(userId, courseNumericId, { fresh: true }),
        getLatestSubmission(userId, courseNumericId),
      ]);
      const progressStatus = progressInfo?.progressStatus;
      const passedQuiz = latest?.submission?.passed === true;
      const notCompleted = progressStatus !== 'Completed';
      const canSubmit = passedQuiz && notCompleted;

      let reason = '';
      if (!passedQuiz) {
        reason = 'Enable after passing this course assessment.';
      } else if (!notCompleted) {
        reason = 'Feedback is not available after course completion.';
      }

      setFeedbackEligibility((prev) => ({
        ...prev,
        [key]: {
          checked: true,
          loading: false,
          canSubmit,
          reason,
        },
      }));
    } catch {
      setFeedbackEligibility((prev) => ({
        ...prev,
        [key]: {
          checked: true,
          loading: false,
          canSubmit: false,
          reason: 'Could not verify eligibility right now.',
        },
      }));
    }
  };

  const normalizeFlow = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');

  const isOrientationRequiredBeforeCourse = (course) => {
    const details = Array.isArray(course?.orientation_detail) ? course.orientation_detail : [];
    return details.some((detail) => normalizeFlow(detail?.orientation_flow) === 'before course completion');
  };

  const prerequisiteCourseName = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.title || item.name || item.course_name || '';
  };

  const findCourseByPrerequisiteRef = (item) => {
    const byId = item?.id != null ? allCourses.find((c) => c.id === item.id) : null;
    if (byId) return byId;
    const byDocumentId = item?.documentId
      ? allCourses.find((c) => String(c.documentId) === String(item.documentId))
      : null;
    if (byDocumentId) return byDocumentId;
    const name = prerequisiteCourseName(item).trim().toLowerCase();
    if (!name) return null;
    return allCourses.find((c) => String(c.title || '').trim().toLowerCase() === name) || null;
  };

  const handleStartCourse = (event, course, courseUrl) => {
    event.preventDefault();
    event.stopPropagation();

    const prerequisites = Array.isArray(course?.prerequisite_courses) ? course.prerequisite_courses : [];
    const missingPrerequisites = prerequisites
      .map((item) => {
        const matchedCourse = typeof item === 'object' ? findCourseByPrerequisiteRef(item) : findCourseByPrerequisiteRef({ title: item });
        const done = !!matchedCourse?.completed;
        if (done) return null;
        const name = prerequisiteCourseName(item) || matchedCourse?.title || 'Prerequisite course';
        const link = matchedCourse?.documentId
          ? `/courses/${String(matchedCourse?.category || 'all').toLowerCase()}/${matchedCourse.documentId}`
          : '';
        return { name, link };
      })
      .filter(Boolean);

    if (missingPrerequisites.length > 0) {
      setStartBlockModal({
        open: true,
        title: 'Prerequisite Required',
        message: 'You must complete prerequisite course(s) first:',
        kind: 'block',
        courseUrl: '',
        prerequisites: missingPrerequisites,
      });
      return;
    }

    if (isOrientationRequiredBeforeCourse(course)) {
      setStartBlockModal({
        open: true,
        title: 'Orientation Warning',
        message: 'You must attend orientation first before starting this course.',
        kind: 'warning',
        courseUrl,
        prerequisites: [],
      });
      return;
    }

    router.push(courseUrl);
  };

  const closeStartModal = () => {
    setStartBlockModal({ open: false, title: '', message: '', kind: 'block', courseUrl: '', prerequisites: [] });
  };

  const handleStartModalOk = () => {
    const continueUrl = startBlockModal.kind === 'warning' ? startBlockModal.courseUrl : '';
    closeStartModal();
    if (continueUrl) {
      router.push(continueUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]" style={courseBgStyle}>
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Courses', href: '/courses' },
          { label: title },
        ]}
        showBreadcrumbSeparator
        containerClassName="pt-xl pb-0 px-xl bg-transparent"
      >
        <p className="text-body text-muted-foreground">
          Explore and complete courses to grow your skills
        </p>
      </PageHeader>
      <main>
        <PageSection className="pt-md">
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isNotStarted = !course.completed && (!course.progress || course.progress === 0);
                const isInProgress = !course.completed && course.progress > 0;
                const isCompleted = !!course.completed;
                const canShowCardMenu = !isCompleted;
                const feedbackKey = String(course.id ?? course.documentId ?? '');
                const feedbackState = feedbackEligibility[feedbackKey] || {
                  checked: false,
                  loading: false,
                  canSubmit: false,
                  reason: '',
                };
                const courseUrl = `/courses/${category}/${course.documentId}`;
                const cardContent = (
                  <SurfaceCard key={course.id} className="flex flex-col h-full rounded-2xl p-0 overflow-hidden cursor-pointer">
                    <div className="relative w-full overflow-hidden pt-4 px-4" style={{ height: 220 }}>
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-3xl"
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
                          <span className="absolute top-0 right-0 mr-12 bg-yellow rounded-md p-1 shadow-md flex items-center">
                            <Award className="w-6 h-6 text-white" />
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
                        <span className="flex-1" />
                        {canShowCardMenu && (
                          <div className="relative ml-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId((prev) => {
                                  const next = prev === course.id ? null : course.id;
                                  if (next === course.id) {
                                    ensureFeedbackEligibility(course);
                                  }
                                  return next;
                                });
                              }}
                              className="p-1 rounded-full hover:bg-gray-100 text-muted-foreground"
                              title="More options"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {openMenuId === course.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                                <button
                                  type="button"
                                  onClick={(e) => handleFeedbackClick(e, course)}
                                  disabled={feedbackState.loading || !feedbackState.canSubmit}
                                  title={feedbackState.reason || undefined}
                                  className={`w-full text-left px-3 py-2 text-sm ${
                                    feedbackState.loading || !feedbackState.canSubmit
                                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {feedbackState.loading ? 'Checking...' : 'Feedback'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="font-medium text-gray-900 text-lg line-clamp-2">
                        {course.title}
                      </div>
                      {isInProgress && (
                        <>
                          <div className="flex items-center justify-between mb-2 mt-2">
                            <span className="text-small font-semibold text-primary">{Math.min(100, course.progress)}% Completed</span>
                            <span className="text-small text-muted-foreground">{course.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-2 bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(100, course.progress)}%` }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                      {isNotStarted && (
                        <Button
                          onClick={(event) => handleStartCourse(event, course, courseUrl)}
                          className="bg-primary text-white rounded-md px-6 py-2 mt-4 flex items-center gap-2 w-full justify-center"
                        >
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

                return (
                  <Link
                    key={course.id}
                    href={courseUrl}
                    style={{ textDecoration: 'none' }}
                    onClick={(event) => {
                      if (isNotStarted) {
                        handleStartCourse(event, course, courseUrl);
                      }
                    }}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          )}
        </PageSection>
      </main>

      {startBlockModal.open && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/45 px-4">
          <div className="w-[min(92vw,520px)] rounded-2xl bg-white border border-gray-200 shadow-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 leading-7 break-words">{startBlockModal.title}</h3>
            <p className="mt-3 text-sm text-gray-600 leading-6 whitespace-normal break-words">
              {startBlockModal.message}
            </p>
            {startBlockModal.kind === 'block' && Array.isArray(startBlockModal.prerequisites) && startBlockModal.prerequisites.length > 0 && (
              <div className="mt-3 space-y-3">
                {startBlockModal.prerequisites.map((item, idx) => (
                  <div key={`${item.name}-${idx}`} className="rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
                    <div className="leading-6 break-words"><span className="font-semibold">Course Name:</span> {item.name}</div>
                    <div className="leading-6 break-all">
                      <span className="font-semibold">Course Redirection Link:</span>{' '}
                      {item.link ? (
                        <Link
                          href={item.link}
                          className="text-primary underline"
                          onClick={closeStartModal}
                        >
                          {item.link}
                        </Link>
                      ) : (
                        <span className="text-gray-500">Not available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleStartModalOk}
                className="bg-primary text-white"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

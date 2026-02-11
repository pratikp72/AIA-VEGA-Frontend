'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import PageContainer from '@/components/layout/PageContainer';
import { loadDashboardData } from '@/features/home/homeSlice';
import {
  selectNewsCarousel,
  selectQuickLinks,
  selectUpcomingEvents,
  selectNewJoinees,
  selectMyCourses,
  selectBirthdaysToday,
  selectWorkAnniversaries,
  selectIsDashboardLoading,
  selectHomeError,
} from '@/features/home/homeSelectors';

import NewsCarousel from '@/features/home/components/NewsCarousel';
import QuickLinks from '@/features/home/components/QuickLinks';
import UpcomingEvents from '@/features/home/components/UpcomingEvents';
import NewJoinees from '@/features/home/components/NewJoinees';
import MyCourses from '@/features/home/components/MyCourses';
import BirthdaysToday from '@/features/home/components/BirthdaysToday';
import WorkAnniversaries from '@/features/home/components/WorkAnniversaries';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

export default function HomePage() {
  const dispatch = useAppDispatch();

  // Selectors
  const news = useAppSelector(selectNewsCarousel);
  const quickLinks = useAppSelector(selectQuickLinks);
  const events = useAppSelector(selectUpcomingEvents);
  const joinees = useAppSelector(selectNewJoinees);
  const courses = useAppSelector(selectMyCourses);
  const birthdays = useAppSelector(selectBirthdaysToday);
  const anniversaries = useAppSelector(selectWorkAnniversaries);
  const isLoading = useAppSelector(selectIsDashboardLoading);
  const error = useAppSelector(selectHomeError);

  // Load dashboard data on mount
  useEffect(() => {
    dispatch(loadDashboardData());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-background">
        <PageContainer className="py-6 sm:py-8">
          <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Home &gt;</div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Good Morning, Erin
          </h1>

          <p className="mt-2 sm:mt-3 text-xs sm:text-lg text-muted-foreground max-w-3xl sm:max-w-5xl">
            Welcome to your learning and information hub. Stay updated with the latest announcements and continue your training journey.
          </p>
        </PageContainer>
      </section>

      {/* Main Content */}
      <main>
        <PageContainer className="py-4 sm:py-6 pb-8">
        <div className="space-y-6">
          {/* News Carousel - Full Width */}
          <NewsCarousel news={news} />

          {/* Upcoming Events- full width */}
              <UpcomingEvents events={events} />

          {/* Quick Links - Full Width */}
          <QuickLinks links={quickLinks} />

          {/* New Joinees & My Courses - Two Column Equal Width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - New Joinees */}
            <div>
              <NewJoinees joinees={joinees} />
            </div>

            {/* Right Column - My Courses */}
            <div>
              <MyCourses courses={courses} />
            </div>
          </div>

          {/* Birthdays & Anniversaries Section - equal column height so both sections align */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Birthdays Today */}
            <BirthdaysToday birthdays={birthdays} />

            {/* Work Anniversaries */}
            <WorkAnniversaries anniversaries={anniversaries} />
          </div>
        </div>
        </PageContainer>
      </main>
    </div>
  );
}
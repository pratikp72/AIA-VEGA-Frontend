'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import PageHeader from '@/components/common/PageHeader';
import PageSection from '@/components/common/PageSection';
import { loadDashboardData, loadMyCourses } from '@/features/home/homeSlice';
import { loadAllNews } from '@/features/news/newsSlice';
import { loadSocialMedias } from '@/features/news/socialMediaSlice';
import { selectSocialMediaList } from '@/features/news/socialMediaSelectors';
import { getSocket } from '@/services/socket';
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
import SocialMediaSection from '@/features/home/components/SocialMediaSection';
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
  const [username, setUsername] = useState('there');

  // Selectors
  const news = useAppSelector(selectNewsCarousel);
  const socialMedia = useAppSelector(selectSocialMediaList);
  const quickLinks = useAppSelector(selectQuickLinks);
  const events = useAppSelector(selectUpcomingEvents);
  const joinees = useAppSelector(selectNewJoinees);
  const courses = useAppSelector(selectMyCourses);
  const birthdays = useAppSelector(selectBirthdaysToday);
  const anniversaries = useAppSelector(selectWorkAnniversaries);
  const isLoading = useAppSelector(selectIsDashboardLoading);
  const error = useAppSelector(selectHomeError);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUsername(user?.username || user?.name || 'there');
    } catch {
      setUsername('there');
    }
  }, []);

  // Load dashboard data, news (carousel), and social media
  useEffect(() => {
    dispatch(loadDashboardData());
    dispatch(loadAllNews());
    dispatch(loadSocialMedias({ page: 1, pageSize: 2, append: false }));
  }, [dispatch]);

  // Real-time course list refresh on course_assigned notification via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNotification = (payload) => {
      if (payload?.type === 'course_assigned') {
        dispatch(loadMyCourses());
      }
    };
    socket.on('new-notification', handleNotification);
    return () => socket.off('new-notification', handleNotification);
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const homeBgStyle = {
    backgroundImage: 'url(/home-page-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'scroll',
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#fafafa]"
        style={homeBgStyle}
      >
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]" style={homeBgStyle}>
      {/* Hero Header */}
      <section className="bg-transparent">
        <PageHeader
          className="bg-transparent"
          containerClassName="pt-xl pb-xl px-xl bg-transparent"
          title={`${getGreeting()}, ${username}`}
          breadcrumbs={[{ label: 'Home' }]}
          showBreadcrumbSeparator
        >
          <p className="text-body text-muted-foreground max-w-3xl sm:max-w-5xl">
            Welcome to your learning and information hub. Stay updated with the latest announcements and continue your training journey.
          </p>
        </PageHeader>
      </section>

      {/* Main Content */}
      <main>
        <PageSection>
        <div className="flex flex-col gap-xl">
          {/* News Carousel - Full Width */}
          <NewsCarousel news={news} />

          {/* Upcoming Events- full width */}
              <UpcomingEvents events={events} />

          {/* Quick Links - Full Width */}
          <QuickLinks links={quickLinks} />
          
          {/* Social Media - Full Width */}
          <SocialMediaSection items={socialMedia} />

          {/* New Joinees & My Courses - Two Column Equal Width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-md items-start">
            {/* Left Column - New Joinees + Birthdays */}
            <div className="flex flex-col gap-md">
              <NewJoinees joinees={joinees} />
              <BirthdaysToday birthdays={birthdays} />
            </div>

            {/* Right Column - My Courses + Anniversaries */}
            <div className="flex flex-col gap-md">
              <MyCourses courses={courses} />
              <WorkAnniversaries anniversaries={anniversaries} />
            </div>
          </div>
        </div>
        </PageSection>
      </main>
    </div>
  );
}
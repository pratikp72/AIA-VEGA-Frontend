'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home01Icon,
  BookOpen01Icon,
  Location01Icon,
  Route01Icon,
  Folder01Icon,
  Calendar01Icon,
  Image01Icon,
  NewsIcon,
} from 'hugeicons-react';
import { ChevronLeft, ChevronRight, X, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home01Icon, label: 'Home', href: '/home' },
  { icon: Users, label: 'People', href: '/people' },
  { icon: BookOpen01Icon, label: 'Courses', href: '/courses' },
  { icon: Location01Icon, label: 'Locations', href: '/locations' },
  { icon: Route01Icon, label: 'Routes', href: '/routes' },
  { icon: Folder01Icon, label: 'Resources', href: '/resources' },
  { icon: NewsIcon, label: 'News', href: '/news' },
  { icon: Calendar01Icon, label: 'Calendar', href: '/calendar' },
  { icon: Image01Icon, label: 'Gallery', href: '/gallery' },
];

export default function AppSidebar({ collapsed = false, onToggle, isMobileOpen = false, onMobileClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#000000] border-r border-[#EAC6FF] transition-all duration-300 z-40',
          'shadow-[2px_4px_4px_0_rgba(0,0,0,0.25)]',
          isMobileOpen ? 'w-64 translate-x-0' : 'hidden sm:block',
          !isMobileOpen && (collapsed ? 'w-19' : 'w-60')
        )}
      >
        {/* Close Button - Mobile Only */}
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="sm:hidden absolute top-4 right-4 p-1 hover:bg-white/10 rounded text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Toggle Button - Desktop Only */}
        {!isMobileOpen && (
          <button
            onClick={() => onToggle && onToggle()}
            className="absolute -right-3 top-6 bg-gradient-to-r from-[#E6BAFF]/60 to-[#9C2EDB]/60 border border-[#9C2EDB]/50 rounded-xl p-1 hover:bg-[#9C2EDB]/70 text-white transition-colors"
            >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors border border-transparent',
                  isActive
                    ? 'bg-gradient-to-r from-[#E6BAFF]/20 to-[#9C2EDB]/20 text-white font-medium border-[#9C2EDB]/50'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
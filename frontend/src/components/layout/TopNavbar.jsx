'use client';

import { Search, Bell, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function TopNavbar({ onMobileMenuToggle }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo + Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => onMobileMenuToggle && onMobileMenuToggle()}
            className="sm:hidden p-2 hover:bg-gray-50 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logo */}
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-h2">A</span>
          </div>
          <span className="hidden sm:block text-h2 text-foreground">AIA Portal</span>
        </div>

        {/* Search, Notifications, Profile - Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Search Bar - Full on md+, toggle on mobile */}
          {searchOpen ? (
            <div className="flex md:hidden relative w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                autoFocus
                className="pl-10 bg-gray-100 border-gray-200 text-body text-gray-600 placeholder:text-gray-400"
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg"
            >
              <Search className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <div className="hidden md:flex relative w-60 lg:w-80 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 bg-gray-100 border-gray-200 text-body text-gray-600 placeholder:text-gray-400"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-50 rounded-lg">
            <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Erin" />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
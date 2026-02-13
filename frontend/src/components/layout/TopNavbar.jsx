'use client';

import { Search, Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

export default function TopNavbar({ onMobileMenuToggle }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#000000] border-b border-gray-800 z-50">
  <div className="h-full px-4 sm:px-6 flex items-center">
    
    {/* LEFT LOGOS */}
    <div className="flex items-center gap-4">
      {/* AIA Logo */}
      <div className="flex items-center">
        <img src="/aia_logo.png" alt="AIA" className="h-10 w-auto object-contain" />
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-gray-700"></div>

      {/* VEGA Logo */}
      <div className="hidden sm:flex items-center">
        <img src="/vega_logo.png" alt="VEGA" className="h-10 w-auto object-contain" />
      </div>
    </div>

    {/* RIGHT SECTION → push using ml-auto */}
    <div className="flex items-center gap-4 ml-auto">
      <div className="hidden md:flex relative">
        <div
          className="relative flex items-center bg-[#3d2d4f] rounded-xl px-5 py-3"
          style={{ width: "303px", height: "40px" }}
        >
          <input
            type="text"
            placeholder="Search people, courses"
            className="flex-1 bg-transparent outline-none text-gray-300 placeholder:text-gray-400"
          />
          <Search className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <button className="p-2 hover:bg-gray-800 rounded-lg">
        <Bell className="w-5 h-5 text-white" />
      </button>

      <Avatar className="h-10 w-10 border-2 border-gray-700">
        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Erin" />
        <AvatarFallback className="bg-purple-600 text-white">ER</AvatarFallback>
      </Avatar>
    </div>
  </div>
</header>
  );
}



'use client';

import { useState, useEffect } from 'react';
import TopNavbar from './TopNavbar';
import AppSidebar from './AppSidebar';
import { SidebarProvider } from './SidebarContext';

export default function LayoutShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isClient) return null;

  return (
    <SidebarProvider value={{ collapsed, isMobile }}>
      <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main
        className="pt-16 transition-all duration-300"
        style={{
          paddingLeft: isMobile ? '0' : collapsed ? '4rem' : '15rem',
        }}
      >
        {children}
      </main>
    </SidebarProvider>
  );
}

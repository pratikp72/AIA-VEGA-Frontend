'use client';

import { createContext, useContext } from 'react';

const SidebarContext = createContext({ collapsed: false, isMobile: false });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ value, children }) {
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

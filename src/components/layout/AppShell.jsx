"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";

export default function AppShell({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-canvas font-sans text-text-primary transition-colors duration-200">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar bg-surface-canvas transition-colors duration-200">
        <AppHeader />
        <div className="w-full px-4 sm:px-6 py-5 sm:py-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

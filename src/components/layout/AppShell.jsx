"use client";

import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import AppHeader from "./AppHeader";

export default function AppShell({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-canvas font-sans text-text-primary transition-colors duration-200">
      {/* 1. Sidebar Nav */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />

      {/* 2. Main Content View Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-surface-canvas transition-colors duration-200">
        <AppHeader />
        <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

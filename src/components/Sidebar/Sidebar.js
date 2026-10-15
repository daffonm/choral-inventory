"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppConfig } from "../providers/AppProvider";
import { Button } from "../ui";

// Crisp SVG Icons matching the reference interface
const Icons = {
  WorklyLogo: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  SidebarToggle: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="4" />
      <path d="M9 3v18" />
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Home: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Notifications: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  DashboardMonitoring: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  MasterData: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  BarangMasuk: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v11" />
      <path d="m8 10 4 4 4-4" />
      <path d="M3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
    </svg>
  ),
  Produksi: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  ),
  Persediaan: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Pesanan: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Transaksi: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  ),
  Tasks: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="4" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  Settings: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Documentation: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  ),
  ReferFriend: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="14" x="3" y="5" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 15h.01" />
      <path d="M12 15h4" />
    </svg>
  ),
  Inbox: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  Support: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Sparkle: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
    </svg>
  ),
  ChevronsUpDown: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  ),
};

export default function Sidebar({
  activeId: controlledActiveId,
  onSelect,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  lang: propLang,
  className = "",
}) {
  const pathname = usePathname();
  const appConfig = useAppConfig();
  const lang = propLang || appConfig.lang || "id";

  const [internalActiveId, setInternalActiveId] = useState("dashboard");
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Emil Kowalski Tooltip: Skip delay on subsequent hovers
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const isAnyTooltipOpenRef = useRef(false);
  const tooltipTimeoutRef = useRef(null);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleSelect = (id) => {
    if (onSelect) onSelect(id);
    else setInternalActiveId(id);
  };

  const handleToggle = () => {
    if (onToggleCollapse) onToggleCollapse(!isCollapsed);
    else setInternalCollapsed(!isCollapsed);
  };

  const isItemActive = (item) => {
    if (controlledActiveId !== undefined) return controlledActiveId === item.id;
    if (item.href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  // Top 7 Primary Modules as requested with Page Routes
  const mainNavItems = [
    {
      id: "dashboard",
      href: "/",
      label: lang === "id" ? "Dashboard Monitoring" : "Dashboard Monitoring",
      icon: Icons.DashboardMonitoring,
    },
    {
      id: "master-data",
      href: "/master-data",
      label: lang === "id" ? "Master Data" : "Master Data",
      icon: Icons.MasterData,
    },
    {
      id: "barang-masuk",
      href: "/barang-masuk",
      label: lang === "id" ? "Barang Masuk" : "Inbound Goods",
      icon: Icons.BarangMasuk,
      badge: 4,
    },
    {
      id: "produksi",
      href: "/produksi",
      label: lang === "id" ? "Produksi" : "Manufacturing",
      icon: Icons.Produksi,
      badge: 8,
    },
    {
      id: "persediaan",
      href: "/persediaan",
      label: lang === "id" ? "Persediaan" : "Inventory",
      icon: Icons.Persediaan,
    },
    {
      id: "pesanan",
      href: "/pesanan",
      label: lang === "id" ? "Pesanan & Fulfillment" : "Orders & Fulfillment",
      icon: Icons.Pesanan,
      badge: 54,
    },
    {
      id: "transaksi",
      href: "/transaksi",
      label: lang === "id" ? "Transaksi" : "Transactions",
      icon: Icons.Transaksi,
    },
  ];

  const otherNavItems = [
    { id: "settings", href: "/settings", label: lang === "id" ? "Pengaturan" : "Settings", icon: Icons.Settings },
    { id: "documentation", href: "/documentation", label: lang === "id" ? "Dokumentasi" : "Documentation", icon: Icons.Documentation },
    { id: "refer-a-friend", href: "/refer-a-friend", label: lang === "id" ? "Ajak Teman" : "Refer a Friend", icon: Icons.ReferFriend },
    { id: "inbox", href: "/inbox", label: lang === "id" ? "Kotak Masuk" : "Inbox", icon: Icons.Inbox },
    { id: "support", href: "/support", label: lang === "id" ? "Bantuan" : "Support", icon: Icons.Support },
  ];


  // Emil Tooltip hover handlers (instant subsequent tooltips)
  const handleMouseEnterItem = (label) => {
    if (!isCollapsed) return;
    if (isAnyTooltipOpenRef.current) {
      setHoveredTooltip(label);
    } else {
      tooltipTimeoutRef.current = setTimeout(() => {
        isAnyTooltipOpenRef.current = true;
        setHoveredTooltip(label);
      }, 150);
    }
  };

  const handleMouseLeaveItem = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      isAnyTooltipOpenRef.current = false;
      setHoveredTooltip(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  const filteredMainNavItems = mainNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredOtherNavItems = otherNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      aria-label="Main sidebar"
      className={`relative flex flex-col h-full min-h-screen apple-sidebar-glass select-none transition-[width] duration-300 ease-[var(--ease-drawer)] ${
        isCollapsed ? "w-[76px]" : "w-[268px]"
      } ${className}`}
    >
      {/* 1. Header: Brand & Collapse Toggle */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06]">
        <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100 flex-1"}`}>
          <div className="w-8 h-8 rounded-lg bg-punch-black flex items-center justify-center text-accent-yellow border border-white/[0.12] shadow-xs shrink-0 font-black text-sm tracking-tighter">
            CH
          </div>
          <div className="flex flex-col truncate">
            <span className="font-extrabold text-sm tracking-tight text-white font-sans truncate">
              CHORAL.ID
            </span>
            <span className="text-[10px] text-white/40 font-mono tracking-tight -mt-0.5">
              Inventory OS
            </span>
          </div>
        </div>

        {/* Apple-style Instant Response Collapse Button */}
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="apple-press p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-[background-color,color] focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-yellow shrink-0 ml-auto"
        >
          <Icons.SidebarToggle className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Search Input with Apple Shortcut Pill */}
      <div className="px-3 pt-4 pb-2">
        {isCollapsed ? (
          <button
            type="button"
            onClick={handleToggle}
            title="Search (⌘ F)"
            className="apple-press w-full h-10 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] transition-[background-color,border-color,color]"
          >
            <Icons.Search className="w-4 h-4" />
          </button>
        ) : (
          <div className="relative flex items-center">
            <Icons.Search className="absolute left-3 w-4 h-4 text-white/35 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "id" ? "Cari modul..." : "Search module..."}
              className="w-full h-9 pl-9 pr-14 text-xs font-medium text-white placeholder-white/30 bg-white/[0.035] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/[0.08] focus:border-accent-yellow/50 rounded-xl transition-[background-color,border-color] focus:outline-none"
            />
            {/* Keyboard shortcut pill */}
            <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white/[0.06] text-white/40 border border-white/[0.08] rounded">
                ⌘ F
              </kbd>
            </div>
          </div>
        )}
      </div>

      {/* 3. Navigation List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-none">
        {/* Main Section */}
        <nav aria-label="Core Navigation" className="space-y-1">
          {filteredMainNavItems.map((item) => {
            const isSelected = isItemActive(item);
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative">
                <Link
                  href={item.href}
                  onClick={() => handleSelect(item.id)}
                  onMouseEnter={() => handleMouseEnterItem(item.label)}
                  onMouseLeave={handleMouseLeaveItem}
                  aria-current={isSelected ? "page" : undefined}
                  className={`sidebar-nav-item relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium outline-none focus:outline-none focus:ring-0 focus-visible:outline-none group overflow-hidden ${
                    isSelected
                      ? "neon-selected-glow text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  } ${isCollapsed ? "justify-center px-0 h-10" : "h-10"}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isSelected ? "text-accent-yellow" : "text-white/60 group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left tracking-[-0.01em]">
                      {item.label}
                    </span>
                  )}

                  {/* 5% Punch Red Notification Indicator */}
                  {item.badge && (
                    <span
                      className={`shrink-0 flex items-center justify-center font-bold text-[10px] text-white rounded-full ${
                        isCollapsed
                          ? "absolute top-1.5 right-2 w-2 h-2 neon-alert-dot"
                          : "px-1.5 py-0.2 min-w-4 h-4 neon-alert-dot"
                      }`}
                    >
                      {!isCollapsed && item.badge}
                    </span>
                  )}
                </Link>

                {/* Emil Kowalski Tooltip (Origin-aware, starts scale(0.95), never scale(0)) */}
                {isCollapsed && hoveredTooltip === item.label && (
                  <div
                    style={{ transformOrigin: "left center" }}
                    className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 rounded-md bg-black-surface border border-white/[0.12] text-xs font-semibold text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* "OTHER" Section Divider */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-3 pb-1 text-[10px] font-bold tracking-[0.08em] uppercase text-white/30 font-mono">
              {lang === "id" ? "Lainnya" : "Other"}
            </div>
          ) : (
            <div className="w-6 h-[1px] bg-white/[0.08] mx-auto my-2" />
          )}

          <nav aria-label="Secondary Navigation" className="space-y-1">
            {filteredOtherNavItems.map((item) => {
              const isSelected = isItemActive(item);
              const Icon = item.icon;

              return (
                <div key={item.id} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => handleSelect(item.id)}
                    onMouseEnter={() => handleMouseEnterItem(item.label)}
                    onMouseLeave={handleMouseLeaveItem}
                    aria-current={isSelected ? "page" : undefined}
                    className={`sidebar-nav-item relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium outline-none focus:outline-none focus:ring-0 focus-visible:outline-none group overflow-hidden ${
                      isSelected
                        ? "neon-selected-glow text-white font-bold"
                        : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                    } ${isCollapsed ? "justify-center px-0 h-10" : "h-10"}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isSelected ? "text-accent-yellow" : "text-white/55 group-hover:text-white"
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left tracking-[-0.01em]">
                        {item.label}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip on Collapsed */}
                  {isCollapsed && hoveredTooltip === item.label && (
                    <div
                      style={{ transformOrigin: "left center" }}
                      className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 rounded-md bg-black-surface border border-white/[0.12] text-xs font-semibold text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
                    >
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 4. Bottom Area: Pro Banner & User Card (Emil's Concentric Nested Radius Applied) */}
      <div className="p-3 space-y-2 border-t border-white/[0.06]">
        {/* "Boost with AI" Frosted Card: Outer R=20px, Padding=14px -> Inner Button R = 20 - 14 = 6px */}
        {!isCollapsed && (
          <div className="apple-card-glass rounded-[20px] p-[14px] relative overflow-hidden group">
            {/* Ambient subtle yellow neon aura */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-accent-yellow/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-1.5">
              <Icons.Sparkle className="w-3.5 h-3.5 text-accent-yellow animate-pulse" />
              <span className="font-bold text-xs text-white tracking-tight">
                {lang === "id" ? "Tingkatkan dengan AI" : "Boost with AI"}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-white/50 mb-3 font-normal">
              {lang === "id"
                ? "Balasan otomatis, wawasan SKU, dan alat efisiensi waktu."
                : "AI-powered replies, tag insights, and tools that save hours."}
            </p>

            {/* Configured Yellow High-Impact CTA Button with Concentric R=6px */}
            <Button
              variant="neon"
              size="sm"
              className="w-full h-8 rounded-[6px] font-bold text-xs tracking-tight"
            >
              {lang === "id" ? "Tingkatkan ke Pro" : "Upgrade to Pro"}
            </Button>
          </div>
        )}

        {/* 5. User Profile Card: Outer R=16px, Padding=8px -> Inner Avatar R = 16 - 8 = 8px */}
        <div
          role="button"
          tabIndex={0}
          title="Switch account"
          className={`apple-press apple-card-glass flex items-center rounded-[16px] p-2 cursor-pointer transition-[background-color] hover:bg-white/[0.07] ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* User Avatar with concentric R=8px */}
            <div className="relative w-8 h-8 rounded-[8px] bg-punch-black border border-white/[0.15] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-white">
              <div className="w-full h-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center text-[11px] font-bold text-white">
                DS
              </div>
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden text-left">
                <div className="text-xs font-bold text-white truncate leading-tight">Damir S.</div>
                <div className="text-[10px] text-white/40 truncate font-mono">damirsch.dev@gmail.com</div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <Icons.ChevronsUpDown className="w-3.5 h-3.5 text-white/40 shrink-0 ml-1" />
          )}
        </div>
      </div>
    </aside>
  );
}

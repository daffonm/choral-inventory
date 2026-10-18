"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppConfig } from "../../providers/AppProvider";
import { useAuth } from "../../providers/AuthProvider";

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
  ChevronDown: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
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
  const { user, logout } = useAuth();
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

  // Declarative navigation schema: Single items & Collapsible groups with sub-items
  const mainNavItems = useMemo(
    () => [
      {
        type: "single",
        id: "dashboard",
        href: "/",
        aliases: ["/dashboard"],
        label: lang === "id" ? "Dashboard Monitoring" : "Dashboard Monitoring",
        icon: Icons.DashboardMonitoring,
      },
      {
        type: "single",
        id: "master-data",
        href: "/master-data",
        label: lang === "id" ? "Master Data" : "Master Data",
        icon: Icons.MasterData,
      },
      {
        type: "collapsible",
        id: "barang-masuk",
        label: lang === "id" ? "Barang Masuk" : "Inbound Goods",
        icon: Icons.BarangMasuk,
        subItems: [
          {
            id: "penerimaan-supplier",
            href: "/barang-masuk/supplier",
            aliases: ["/barang-masuk"],
            label: lang === "id" ? "Penerimaan Supplier" : "Supplier Receipts",
            badge: 4,
          },
          {
            id: "hasil-produksi",
            href: "/barang-masuk/produksi",
            aliases: ["/produksi"],
            label: lang === "id" ? "Hasil Produksi" : "Production Inbound",
            badge: 8,
          },
          {
            id: "barang-retur",
            href: "/barang-masuk/retur",
            label: lang === "id" ? "Barang Retur" : "Return Orders",
          },
        ],
      },
      {
        type: "collapsible",
        id: "barang-keluar",
        label: lang === "id" ? "Barang Keluar" : "Outbound Orders",
        icon: Icons.Pesanan,
        subItems: [
          {
            id: "daftar-pesanan",
            href: "/barang-keluar/daftar",
            aliases: ["/barang-keluar", "/pesanan", "/pesanan/daftar"],
            label: lang === "id" ? "Daftar Pesanan" : "Orders List",
            badge: 38,
          },
          {
            id: "proses-fulfillment",
            href: "/barang-keluar/fulfillment",
            aliases: ["/pesanan/fulfillment"],
            label: lang === "id" ? "Proses Fulfillment" : "Fulfillment Pipeline",
            badge: 16,
          },
          {
            id: "riwayat-pesanan",
            href: "/barang-keluar/riwayat",
            aliases: ["/pesanan/riwayat"],
            label: lang === "id" ? "Riwayat Pesanan" : "Order History",
          },
        ],
      },
      {
        type: "collapsible",
        id: "persediaan",
        label: lang === "id" ? "Persediaan" : "Inventory",
        icon: Icons.Persediaan,
        subItems: [
          {
            id: "stok-saat-ini",
            href: "/persediaan/stok-saat-ini",
            aliases: ["/persediaan"],
            label: lang === "id" ? "Stok Saat Ini" : "Current Stock",
          },
          {
            id: "pergerakan-stok",
            href: "/persediaan/pergerakan",
            label: lang === "id" ? "Pergerakan Stok" : "Stock Movement",
          },
          {
            id: "alokasi-stok",
            href: "/persediaan/alokasi",
            label: lang === "id" ? "Alokasi Stok" : "Stock Allocation",
          },
          {
            id: "stock-opname",
            href: "/persediaan/opname",
            label: lang === "id" ? "Stock Opname" : "Stock Opname",
          },
          {
            id: "stok-minimum",
            href: "/persediaan/minimum",
            label: lang === "id" ? "Stok Minimum" : "Buffer Alerts",
            badge: 3,
          },
        ],
      },
      {
        type: "collapsible",
        id: "transaksi",
        label: lang === "id" ? "Transaksi" : "Transactions",
        icon: Icons.Transaksi,
        subItems: [
          {
            id: "transaksi-keluar",
            href: "/transaksi/keluar",
            aliases: ["/transaksi"],
            label: lang === "id" ? "Barang Keluar" : "Goods Issue",
          },
          {
            id: "transaksi-riwayat",
            href: "/transaksi/riwayat",
            label: lang === "id" ? "Riwayat Transaksi" : "Transaction Ledger",
          },
        ],
      },
    ],
    [lang]
  );

  const otherNavItems = useMemo(
    () => [
      { id: "settings", href: "/settings", label: lang === "id" ? "Pengaturan" : "Settings", icon: Icons.Settings },
      { id: "documentation", href: "/documentation", label: lang === "id" ? "Dokumentasi" : "Documentation", icon: Icons.Documentation },
      { id: "refer-a-friend", href: "/refer-a-friend", label: lang === "id" ? "Ajak Teman" : "Refer a Friend", icon: Icons.ReferFriend },
      { id: "inbox", href: "/inbox", label: lang === "id" ? "Kotak Masuk" : "Inbox", icon: Icons.Inbox },
      { id: "support", href: "/support", label: lang === "id" ? "Bantuan" : "Support", icon: Icons.Support },
    ],
    [lang]
  );

  // Active route helpers
  const isSingleItemActive = (item) => {
    if (controlledActiveId !== undefined) return controlledActiveId === item.id;
    if (!pathname) return false;
    if (item.href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    if (item.aliases && item.aliases.some((alias) => pathname === alias || (alias !== "/" && pathname.startsWith(alias + "/")))) {
      return true;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const isSubItemActive = useCallback(
    (sub) => {
      if (controlledActiveId !== undefined) return controlledActiveId === sub.id;
      if (!pathname) return false;
      // Exact match on sub.href
      if (pathname === sub.href) return true;
      // Exact match on designated alias routes
      if (sub.aliases && sub.aliases.includes(pathname)) return true;
      // Deep child route match for nested pages under sub.href (e.g. /barang-masuk/supplier/123)
      return sub.href !== "/" && pathname.startsWith(sub.href + "/");
    },
    [controlledActiveId, pathname]
  );

  // Manage accordion open state with route auto-expand
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    mainNavItems.forEach((item) => {
      if (item.type === "collapsible" && item.subItems) {
        if (item.subItems.some(isSubItemActive)) {
          initial[item.id] = true;
        }
      }
    });
    return initial;
  });

  // Keep group open when navigating to a sub-route
  useEffect(() => {
    mainNavItems.forEach((item) => {
      if (item.type === "collapsible" && item.subItems) {
        if (item.subItems.some(isSubItemActive)) {
          setOpenGroups((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
        }
      }
    });
  }, [pathname, mainNavItems, isSubItemActive]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Cumulative notification badge calculation for collapsible parents
  const getCumulativeBadge = (item) => {
    if (item.badge !== undefined) return item.badge;
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.reduce((acc, sub) => acc + (sub.badge || 0), 0);
    }
    return 0;
  };

  // Emil Kowalski Tooltip hover handlers (instant subsequent tooltips)
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

  // Filter with hierarchical awareness: searching matches single items, collapsible parents, or sub-items
  const filteredMainNavItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return mainNavItems;

    return mainNavItems
      .map((item) => {
        if (item.type === "single") {
          return item.label.toLowerCase().includes(query) ? item : null;
        }
        const parentMatches = item.label.toLowerCase().includes(query);
        const matchingSubItems = item.subItems.filter(
          (sub) => parentMatches || sub.label.toLowerCase().includes(query)
        );
        if (parentMatches || matchingSubItems.length > 0) {
          return {
            ...item,
            subItems: matchingSubItems,
            isSearching: true,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [mainNavItems, searchQuery]);

  const filteredOtherNavItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return otherNavItems;
    return otherNavItems.filter((item) => item.label.toLowerCase().includes(query));
  }, [otherNavItems, searchQuery]);

  return (
    <aside
      aria-label="Main sidebar"
      data-slot="sidebar"
      className={`relative flex flex-col h-full min-h-screen apple-sidebar-glass select-none transition-[width] duration-300 ease-[var(--ease-drawer)] ${isCollapsed ? "w-[76px]" : "w-[268px]"
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
          className={`apple-press text-white/50 hover:text-white hover:bg-white/[0.06] transition-[background-color,color] focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-yellow shrink-0 ${
            isCollapsed
              ? "w-8 h-8 mx-auto flex items-center justify-center rounded-full p-0"
              : "p-2 rounded-lg ml-auto"
          }`}
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
            className="apple-press w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] transition-[background-color,border-color,color]"
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
              placeholder={lang === "id" ? "Cari modul & menu..." : "Search module & menu..."}
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
            const Icon = item.icon;

            // CASE A: Single Menu (Dashboard Monitoring, Master Data)
            if (item.type === "single") {
              const isSelected = isSingleItemActive(item);

              return (
                <div key={item.id} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => handleSelect(item.id)}
                    onMouseEnter={() => handleMouseEnterItem(item.label)}
                    onMouseLeave={handleMouseLeaveItem}
                    aria-current={isSelected ? "page" : undefined}
                    data-slot="sidebar-nav-item"
                    className={`sidebar-nav-item apple-press relative flex items-center text-xs outline-none focus:outline-none focus:ring-0 focus-visible:outline-none group overflow-hidden ${
                      isCollapsed
                        ? `w-8 h-8 mx-auto justify-center px-0 rounded-full ${
                            isSelected
                              ? "neon-selected-glow text-white font-bold"
                              : "text-white/60 hover:text-white hover:bg-white/[0.04] font-medium"
                          }`
                        : `w-full gap-3 px-3 py-2 rounded-xl ${
                            isSelected
                              ? "bg-white/[0.08] border border-white/[0.08] text-white font-bold shadow-xs"
                              : "text-white/60 hover:text-white hover:bg-white/[0.04] font-medium"
                          }`
                    }`}
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

                    {item.badge && (
                      <span
                        className={`shrink-0 flex items-center justify-center font-bold text-white rounded-full ${
                          isCollapsed
                            ? "absolute top-1 right-1 w-1.5 h-1.5 neon-alert-dot"
                            : "px-1.5 min-w-4 h-4 text-[10px] neon-alert-dot"
                        }`}
                      >
                        {!isCollapsed && item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Emil Kowalski Tooltip for Collapsed Sidebar */}
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
            }

            // CASE B: Collapsible Menu (Barang Masuk, Barang Keluar, Persediaan, Transaksi)
            // Rules strictly followed:
            // 1. Parent bar CANNOT be activated as page and does NOT redirect.
            // 2. Notification is the cumulative total of its sub-items.
            const totalBadge = getCumulativeBadge(item);
            const isOpen = item.isSearching || !!openGroups[item.id];
            const isAnySubActive = item.subItems?.some(isSubItemActive);
            const tooltipLabel = `${item.label}${totalBadge > 0 ? ` (${totalBadge})` : ""}`;

            return (
              <div key={item.id} className="relative">
                {/* Collapsible Parent Interactive Bar */}
                <button
                  type="button"
                  data-slot="sidebar-collapsible-trigger"
                  onClick={() => {
                    if (isCollapsed) {
                      handleToggle();
                      setOpenGroups((prev) => ({ ...prev, [item.id]: true }));
                    } else {
                      toggleGroup(item.id);
                    }
                  }}
                  onMouseEnter={() => handleMouseEnterItem(tooltipLabel)}
                  onMouseLeave={handleMouseLeaveItem}
                  aria-expanded={isOpen}
                  aria-controls={`sub-menu-${item.id}`}
                  className={`apple-press relative flex items-center text-xs outline-none focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-accent-yellow/40 transition-[background-color,color] ${
                    isCollapsed
                      ? `w-8 h-8 mx-auto justify-center px-0 rounded-full ${
                          isAnySubActive
                            ? "neon-selected-glow text-white font-bold"
                            : "text-white/70 hover:text-white hover:bg-white/[0.04] font-medium"
                        }`
                      : `w-full gap-3 px-3 py-2 rounded-xl font-medium ${
                          isAnySubActive
                            ? "text-white bg-white/[0.04]"
                            : "text-white/70 hover:text-white hover:bg-white/[0.04]"
                        }`
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isAnySubActive
                        ? "text-accent-yellow"
                        : "text-white/60 group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left tracking-[-0.01em]">
                        {item.label}
                      </span>

                      {/* Cumulative Badge Total from Sub-items */}
                      {totalBadge > 0 && (
                        <span className="shrink-0 flex items-center justify-center font-bold text-[10px] text-white rounded-full px-1.5 min-w-4 h-4 neon-alert-dot">
                          {totalBadge}
                        </span>
                      )}

                      {/* Rotating Chevron Indicator */}
                      <Icons.ChevronDown
                        className={`w-3.5 h-3.5 text-white/40 shrink-0 transition-transform duration-200 ease-[var(--ease-out)] ${
                          isOpen ? "rotate-180 text-white/80" : "rotate-0"
                        }`}
                      />
                    </>
                  )}

                  {/* Red dot alert indicator when collapsed */}
                  {isCollapsed && totalBadge > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full neon-alert-dot" />
                  )}
                </button>

                {/* Sub-Items Container with Emil Kowalski 60fps CSS Grid transition */}
                {!isCollapsed && (
                  <div
                    id={`sub-menu-${item.id}`}
                    role="region"
                    aria-label={item.label}
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-[var(--ease-out)] ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden space-y-0.5 pt-1 pl-3">
                      {item.subItems.map((sub) => {
                        const isSubSelected = isSubItemActive(sub);

                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={() => handleSelect(sub.id)}
                            aria-current={isSubSelected ? "page" : undefined}
                            data-slot="sidebar-sub-item"
                            className={`apple-press relative w-full flex items-center pl-7 pr-2.5 py-2 rounded-xl text-xs outline-none focus:outline-none transition-[background-color,color] group ${
                              isSubSelected
                                ? "bg-white/[0.08] border border-white/[0.08] text-white font-bold shadow-xs"
                                : "text-white/60 hover:text-white hover:bg-white/[0.04] font-medium"
                            }`}
                          >
                            <span className={`truncate flex-1 text-left tracking-[-0.01em] ${isSubSelected ? "text-accent-yellow" : ""}`}>
                              {sub.label}
                            </span>

                            {/* Sub-item specific notification badge */}
                            {sub.badge && (
                              <span className="shrink-0 flex items-center justify-center font-bold text-[9px] text-white rounded-full px-1.5 min-w-3.5 h-3.5 neon-alert-dot">
                                {sub.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tooltip for Collapsed Sidebar */}
                {isCollapsed && hoveredTooltip === tooltipLabel && (
                  <div
                    style={{ transformOrigin: "left center" }}
                    className="absolute left-[78px] top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 rounded-md bg-black-surface border border-white/[0.12] text-xs font-semibold text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 pointer-events-none flex items-center gap-1.5"
                  >
                    <span>{item.label}</span>
                    {totalBadge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white bg-punch-red">
                        {totalBadge}
                      </span>
                    )}
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
              const isSelected = isSingleItemActive(item);
              const Icon = item.icon;

              return (
                <div key={item.id} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => handleSelect(item.id)}
                    onMouseEnter={() => handleMouseEnterItem(item.label)}
                    onMouseLeave={handleMouseLeaveItem}
                    aria-current={isSelected ? "page" : undefined}
                    data-slot="sidebar-nav-secondary-item"
                    className={`sidebar-nav-item apple-press relative flex items-center text-xs outline-none focus:outline-none focus:ring-0 focus-visible:outline-none group overflow-hidden ${
                      isCollapsed
                        ? `w-8 h-8 mx-auto justify-center px-0 rounded-full ${
                            isSelected
                              ? "neon-selected-glow text-white font-bold"
                              : "text-white/55 hover:text-white hover:bg-white/[0.04] font-medium"
                          }`
                        : `w-full gap-3 px-3 py-2 rounded-xl font-medium ${
                            isSelected
                              ? "bg-white/[0.08] border border-white/[0.08] text-white font-bold shadow-xs"
                              : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                          }`
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? "text-accent-yellow" : "text-white/55 group-hover:text-white"
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
        {/* User Profile Card */}
        <div
          className={`apple-press apple-card-glass flex items-center transition-[background-color] hover:bg-white/[0.07] ${
            isCollapsed
              ? "w-8 h-8 mx-auto justify-center p-0 rounded-full"
              : "rounded-[16px] p-2 justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* User Avatar with concentric R=8px or circular when collapsed */}
            <div
              className={`relative bg-punch-black border border-white/[0.15] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-white ${
                isCollapsed ? "w-8 h-8 rounded-full" : "w-8 h-8 rounded-[8px]"
              }`}
            >
              <div className="w-full h-full bg-gradient-to-tr from-accent-yellow/30 to-zinc-700 flex items-center justify-center text-[11px] font-bold text-accent-yellow font-mono">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : "CH"}
              </div>
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden text-left">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {user?.displayName || (user?.email ? user.email.split("@")[0] : "Staf Gudang")}
                </div>
                <div className="text-[10px] text-white/40 truncate font-mono">
                  {user?.email || "offline"}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => logout()}
              title="Keluar dari akun (Logout)"
              className="text-white/40 hover:text-red-400 p-1.5 rounded-md transition-colors ml-1 cursor-pointer hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

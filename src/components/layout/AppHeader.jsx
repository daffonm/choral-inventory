"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAppConfig } from "../providers/AppProvider";
import { Button, Icons } from "../ui";
import { cn } from "../../lib/utils";

export default function AppHeader({ className, containerClassName }) {
  const pathname = usePathname();
  const { lang, theme, toggleTheme } = useAppConfig();

  const titles = {
    "/": lang === "id" ? "Dashboard Monitoring" : "Monitoring Dashboard",
    "/dashboard": lang === "id" ? "Dashboard Monitoring" : "Monitoring Dashboard",
    "/master-data": lang === "id" ? "Master Data" : "Master Data",
    "/barang-masuk": lang === "id" ? "Barang Masuk" : "Inbound Logistics",
    "/produksi": lang === "id" ? "Produksi & Semi-Mfg" : "Manufacturing",
    "/persediaan": lang === "id" ? "Persediaan & Stok" : "Inventory Stock",
    "/pesanan": lang === "id" ? "Pesanan & Fulfillment" : "Orders & Fulfillment",
    "/transaksi": lang === "id" ? "Transaksi Mutasi" : "Transactions Ledger",
    "/settings": lang === "id" ? "Pengaturan Sistem" : "System Settings",
    "/documentation": lang === "id" ? "Dokumentasi SOP" : "Documentation SOP",
    "/refer-a-friend": lang === "id" ? "Ajak Mitra" : "Refer a Partner",
    "/inbox": lang === "id" ? "Kotak Masuk" : "Inbox Notifications",
    "/support": lang === "id" ? "Pusat Bantuan" : "Support Center",
  };

  const currentTitle = titles[pathname] || "CHORAL.ID Inventory";

  return (
    <header
      data-slot="app-header"
      className={cn(
        "sticky top-0 z-20 h-16 w-full shrink-0 border-b border-border-subtle bg-surface-card/85 backdrop-blur-md transition-colors duration-200",
        className
      )}
    >
      <div
        data-slot="app-header-container"
        className={cn(
          "max-w-6xl w-full mx-auto h-full px-6 sm:px-8 flex items-center justify-between gap-4",
          containerClassName
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-black-primary truncate">
            {currentTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Light / Dark Mode Toggle Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            title={theme === "dark" ? "Ganti ke Mode Terang (Light)" : "Ganti ke Mode Gelap (Dark)"}
            className="flex items-center gap-1.5"
          >
            {theme === "dark" ? (
              <>
                <Icons.Sun className="size-3.5 text-accent-yellow" />
                <span className="hidden sm:inline">Terang</span>
              </>
            ) : (
              <>
                <Icons.Moon className="size-3.5 text-black-primary" />
                <span className="hidden sm:inline">Gelap</span>
              </>
            )}
          </Button>

          <Button
            href="/"
            variant={pathname === "/" || pathname === "/dashboard" ? "primary" : "secondary"}
            size="sm"
          >
            Dashboard
          </Button>

          <Button
            href="/settings"
            variant={pathname === "/settings" ? "primary" : "secondary"}
            size="sm"
          >
            {lang === "id" ? "Pengaturan" : "Settings"}
          </Button>
        </div>
      </div>
    </header>
  );
}

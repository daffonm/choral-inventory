"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAppConfig } from "../providers/AppProvider";
import { Button, Badge, Icons } from "../ui";

export default function AppHeader() {
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
    <header className="h-16 px-6 sm:px-8 border-b border-border-subtle bg-surface-card/85 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-black tracking-tight text-black-primary">
          {currentTitle}
        </h1>
        <Badge variant="yellow" dot size="sm">
          CHORAL.ID &bull; {lang.toUpperCase()} &bull; {theme.toUpperCase()}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Light / Dark Mode Toggle Button (No device mode) */}
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          title={theme === "dark" ? "Ganti ke Mode Terang (Light)" : "Ganti ke Mode Gelap (Dark)"}
          className="flex items-center gap-1.5"
        >
          {theme === "dark" ? (
            <>
              <Icons.Sun className="w-3.5 h-3.5 text-accent-yellow" />
              <span className="hidden sm:inline">Terang</span>
            </>
          ) : (
            <>
              <Icons.Moon className="w-3.5 h-3.5 text-black-primary" />
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
    </header>
  );
}

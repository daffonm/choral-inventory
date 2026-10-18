"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAppConfig } from "../../providers/AppProvider";
import { useAuth } from "../../providers/AuthProvider";
import { Button, Icons } from "../ui";
import { cn } from "@/lib/utils/utils";

export default function AppHeader({ className, containerClassName }) {
  const pathname = usePathname();
  const { lang, theme, toggleTheme } = useAppConfig();
  const { user, logout } = useAuth();

  const titles = {
    "/": lang === "id" ? "Dashboard Monitoring" : "Monitoring Dashboard",
    "/dashboard": lang === "id" ? "Dashboard Monitoring" : "Monitoring Dashboard",
    "/master-data": lang === "id" ? "Master Data" : "Master Data",
    "/barang-masuk": lang === "id" ? "Barang Masuk" : "Inbound Logistics",
    "/barang-masuk/supplier": lang === "id" ? "Barang Masuk • Penerimaan Supplier" : "Inbound • Supplier Receipts",
    "/barang-masuk/produksi": lang === "id" ? "Barang Masuk • Hasil Produksi" : "Inbound • Production Yield",
    "/barang-masuk/retur": lang === "id" ? "Barang Masuk • Barang Retur" : "Inbound • Return Orders",
    "/produksi": lang === "id" ? "Produksi & Semi-Mfg" : "Manufacturing",
    "/barang-keluar": lang === "id" ? "Barang Keluar & Fulfillment" : "Outbound Logistics",
    "/barang-keluar/daftar": lang === "id" ? "Barang Keluar • Daftar Pesanan" : "Outbound • Orders Queue",
    "/barang-keluar/fulfillment": lang === "id" ? "Barang Keluar • Proses Fulfillment" : "Outbound • Fulfillment Pipeline",
    "/barang-keluar/riwayat": lang === "id" ? "Barang Keluar • Riwayat Pesanan" : "Outbound • Completed Orders",
    "/pesanan": lang === "id" ? "Barang Keluar & Fulfillment" : "Outbound Logistics",
    "/pesanan/daftar": lang === "id" ? "Barang Keluar • Daftar Pesanan" : "Outbound • Orders Queue",
    "/pesanan/fulfillment": lang === "id" ? "Barang Keluar • Proses Fulfillment" : "Outbound • Fulfillment Pipeline",
    "/pesanan/riwayat": lang === "id" ? "Barang Keluar • Riwayat Pesanan" : "Outbound • Completed Orders",
    "/persediaan": lang === "id" ? "Persediaan & Kontrol Stok" : "Inventory Stock Control",
    "/persediaan/stok-saat-ini": lang === "id" ? "Persediaan • Stok Saat Ini" : "Inventory • Current Stock",
    "/persediaan/pergerakan": lang === "id" ? "Persediaan • Pergerakan Stok" : "Inventory • Stock Movement",
    "/persediaan/alokasi": lang === "id" ? "Persediaan • Alokasi Stok" : "Inventory • Channel Allocation",
    "/persediaan/opname": lang === "id" ? "Persediaan • Stock Opname" : "Inventory • Stock Opname",
    "/persediaan/minimum": lang === "id" ? "Persediaan • Stok Minimum" : "Inventory • Buffer Alerts",
    "/transaksi": lang === "id" ? "Transaksi Mutasi & Pengeluaran" : "Transactions Ledger",
    "/transaksi/keluar": lang === "id" ? "Transaksi • Barang Keluar" : "Transactions • Goods Issue",
    "/transaksi/riwayat": lang === "id" ? "Transaksi • Riwayat Terpadu" : "Transactions • Unified Ledger",
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
          "w-full h-full px-4 sm:px-6 flex items-center justify-between gap-4",
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

          {user && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => logout()}
              title="Keluar dari akun (Logout)"
              className="hover:text-red-400 hover:border-red-500/30 transition-colors"
            >
              <span className="hidden sm:inline">Keluar</span>
              <span className="sm:hidden">✕</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

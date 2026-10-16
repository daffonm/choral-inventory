"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  SegmentedControl,
  Icons,
} from "../ui";
import { useAppConfig } from "../providers/AppProvider";
import { dashboardData, formatNumber } from "../../lib";

export default function DashboardView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [chartRange, setChartRange] = useState("7d");
  const { kpis, pergerakanStokChart, aktivitasTerbaru } = dashboardData;

  const maxVal = Math.max(...pergerakanStokChart.map((d) => Math.max(d.incoming, d.outgoing)));

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Dashboard Monitoring" : "Monitoring Dashboard"}
            </h2>
            <Badge variant="yellow" dot size="sm">
              Live Sync
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Ringkasan real-time kesehatan inventaris, pergerakan stok, dan aktivitas operasional CHORAL."
              : "Real-time overview of inventory health, stock movements, and CHORAL operations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Unduh Laporan" : "Export Report"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? "Buat Transaksi" : "New Transaction"}
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Total Produk, Total Material, Total Stok) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Produk */}
        <Card className="hover:border-accent-yellow/40 transition-[border-color] duration-150 ease-out">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {lang === "id" ? "Total Produk Aktif" : "Total Active Products"}
              </span>
              <span className="size-8 rounded-lg bg-surface-muted flex items-center justify-center text-black-primary border border-border-subtle">
                <Icons.ProductBag className="size-4 text-black-primary" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-black-primary font-mono">
                {kpis.totalProduk}
              </span>
              <span className="text-xs text-text-muted">SKU Terdaftar</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
              <span>Produk Jadi Siap Jual</span>
              <span className="font-semibold text-accent-yellow-hover font-mono">100% Sync</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Material */}
        <Card className="hover:border-accent-yellow/40 transition-[border-color] duration-150 ease-out">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {lang === "id" ? "Total Material & Bahan" : "Total Raw Materials"}
              </span>
              <span className="size-8 rounded-lg bg-surface-muted flex items-center justify-center text-black-primary border border-border-subtle">
                <Icons.MaterialFabric className="size-4 text-black-primary" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-black-primary font-mono">
                {kpis.totalMaterial}
              </span>
              <span className="text-xs text-text-muted">Bahan Baku & Aksesoris</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
              <span>Cordura, YKK, Acetal, Webbing</span>
              <span className="font-semibold text-black-primary font-mono">5 Supplier</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Stok Fisik */}
        <Card className="hover:border-accent-yellow/40 transition-[border-color] duration-150 ease-out">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {lang === "id" ? "Total Stok Fisik" : "Total Physical Stock"}
              </span>
              <span className="size-8 rounded-lg bg-accent-yellow-surface flex items-center justify-center text-black-primary border border-accent-yellow-border">
                <Icons.Package className="size-4 text-black-primary" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-black-primary font-mono">
                {formatNumber(kpis.totalStok)}
              </span>
              <span className="text-xs text-text-muted">Pcs Unit</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-secondary">
              <span>Di 4 Gudang &amp; Hub</span>
              <Badge variant="yellow" size="sm">Optimal</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Breakdown: Available Stock, Reserved Stock, Damaged Stock */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{lang === "id" ? "Status Ketersediaan Stok" : "Stock Health Breakdown"}</CardTitle>
            <CardDescription>
              {lang === "id"
                ? "Pembagian fisik stok gudang berdasarkan status alokasi dan kelayakan jual."
                : "Warehouse physical stock segregated by allocation status and salability."}
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-text-muted">
            Total Unit: {formatNumber(kpis.totalStok)} Pcs
          </span>
        </CardHeader>
        <CardContent>
          {/* Visual Multi-Color Segmented Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-surface-muted border border-border-subtle">
            <div
              style={{ width: `${(kpis.availableStock / kpis.totalStok) * 100}%` }}
              className="bg-accent-yellow transition-[width] duration-300 ease-[var(--ease-out)]"
              title="Available Stock"
            />
            <div
              style={{ width: `${(kpis.reservedStock / kpis.totalStok) * 100}%` }}
              className="bg-punch-black transition-[width] duration-300 ease-[var(--ease-out)]"
              title="Reserved Stock"
            />
            <div
              style={{ width: `${(kpis.damagedStock / kpis.totalStok) * 100}%` }}
              className="bg-accent-red transition-[width] duration-300 ease-[var(--ease-out)]"
              title="Damaged Stock"
            />
          </div>

          {/* Cards for each breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {/* Available */}
            <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black-primary flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-accent-yellow inline-block" />
                  Available Stock
                </span>
                <Badge variant="yellow" size="sm">Siap Jual</Badge>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-black-primary">
                  {formatNumber(kpis.availableStock)}
                  <span className="text-xs font-normal text-text-muted ml-1">pcs</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                  Stok bebas alokasi yang siap diproses fulfillment marketplace.
                </p>
              </div>
            </div>

            {/* Reserved */}
            <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black-primary flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-punch-black inline-block" />
                  Reserved Stock
                </span>
                <Badge variant="dark" size="sm">Terkunci</Badge>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-black-primary">
                  {formatNumber(kpis.reservedStock)}
                  <span className="text-xs font-normal text-text-muted ml-1">pcs</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                  Telah dipesan di checkout pembeli, bazaar offline, atau consignment.
                </p>
              </div>
            </div>

            {/* Damaged */}
            <div className="p-4 rounded-xl bg-accent-red-surface/30 border border-accent-red-border/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent-red flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-accent-red inline-block" />
                  Damaged Stock
                </span>
                <Badge variant="red" size="sm" dot>Karantina</Badge>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black font-mono text-accent-red">
                  {formatNumber(kpis.damagedStock)}
                  <span className="text-xs font-normal text-text-muted ml-1">pcs</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">
                  Barang cacat retur konsumen atau hasil jahit reject menunggu reparasi.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Three Operational Status Counters (Stok Menipis, Pesanan Berjalan, Produksi Berjalan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stok Menipis */}
        <Card className="border-l-4 border-l-accent-red">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-accent-red uppercase tracking-wider font-mono">
                Peringatan Buffer
              </div>
              <div className="text-xl font-black text-black-primary mt-1">
                {kpis.stokMenipis} SKU Menipis
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Di bawah batas minimum buffer gudang
              </p>
            </div>
            <Badge variant="red" dot size="sm">Tindakan Diperlukan</Badge>
          </CardContent>
        </Card>

        {/* Pesanan Berjalan */}
        <Card className="border-l-4 border-l-accent-yellow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-accent-yellow-hover uppercase tracking-wider font-mono">
                Order Fulfillment
              </div>
              <div className="text-xl font-black text-black-primary mt-1">
                {kpis.pesananBerjalan} Pesanan Berjalan
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Sedang diproses di picking &amp; packing
              </p>
            </div>
            <Badge variant="yellow" size="sm">In Progress</Badge>
          </CardContent>
        </Card>

        {/* Produksi Berjalan */}
        <Card className="border-l-4 border-l-black-primary">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">
                Workshop Semi-Mfg
              </div>
              <div className="text-xl font-black text-black-primary mt-1">
                {kpis.produksiBerjalan} Batch Produksi
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Sedang dijahit di Cimahi &amp; Bandung
              </p>
            </div>
            <Badge variant="neutral" size="sm">On Schedule</Badge>
          </CardContent>
        </Card>
      </div>

      {/* 5. Grafik Pergerakan Stok & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Pergerakan Stok (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Grafik Pergerakan Stok (Inbound vs Outbound)" : "Stock Movement Trend"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Fluktuasi harian barang masuk (hasil produksi/supplier) vs barang keluar (fulfillment)"
                  : "Daily fluctuation of incoming goods vs outgoing fulfillment orders"}
              </CardDescription>
            </div>

            <SegmentedControl
              value={chartRange}
              onChange={setChartRange}
              options={[
                { value: "7d", label: "7 Hari" },
                { value: "30d", label: "30 Hari" },
              ]}
            />
          </CardHeader>
          <CardContent>
            {/* Visual Bar Chart comparing In vs Out */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-end gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-xs bg-accent-yellow border border-accent-yellow-border inline-block" />
                  Barang Masuk (Incoming)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-xs bg-punch-black inline-block" />
                  Barang Keluar (Outgoing)
                </span>
              </div>

              {/* Chart Bars */}
              <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-border-subtle">
                {pergerakanStokChart.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Incoming bar */}
                      <div
                        style={{ height: `${(item.incoming / maxVal) * 100}%` }}
                        className="w-3 sm:w-4 bg-accent-yellow hover:bg-accent-yellow-hover rounded-t transition-[transform,background-color] duration-150 ease-out group-hover:scale-y-105 origin-bottom relative"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 scale-95 origin-bottom group-hover:opacity-100 group-hover:scale-100 transition-[transform,opacity] duration-150 ease-out bg-black-surface text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-sm pointer-events-none whitespace-nowrap z-10">
                          +{item.incoming}
                        </div>
                      </div>

                      {/* Outgoing bar */}
                      <div
                        style={{ height: `${(item.outgoing / maxVal) * 100}%` }}
                        className="w-3 sm:w-4 bg-punch-black hover:bg-black-hover rounded-t transition-[transform,background-color] duration-150 ease-out group-hover:scale-y-105 origin-bottom relative"
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 scale-95 origin-bottom group-hover:opacity-100 group-hover:scale-100 transition-[transform,opacity] duration-150 ease-out bg-black-surface text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-sm pointer-events-none whitespace-nowrap z-10">
                          -{item.outgoing}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-text-muted truncate">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                <span>Rata-rata Harian: ~540 pcs pergerakan</span>
                <span className="font-mono font-bold text-black-primary">
                  Net Delta Mingguan: +640 pcs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktivitas Terbaru (1 col) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Aktivitas Terbaru" : "Recent Activity"}</CardTitle>
              <CardDescription>
                {lang === "id" ? "Log audit real-time inventaris" : "Real-time inventory audit trail"}
              </CardDescription>
            </div>
            <Badge variant="yellow" size="sm">Real-time</Badge>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border-subtle max-h-[380px] overflow-y-auto">
              {aktivitasTerbaru.map((act) => (
                <div key={act.id} className="p-4 hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-black-primary">
                      {act.title}
                    </span>
                    <Badge variant={act.badgeVariant} size="sm">
                      {act.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1 line-clamp-2">
                    {act.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>{act.user}</span>
                    <span>{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              {lang === "id" ? "Lihat Semua Audit Log →" : "View All Audit Logs →"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

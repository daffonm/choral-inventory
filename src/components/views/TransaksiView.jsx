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
import { transaksiData } from "../../lib/dummyData";

export default function TransaksiView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("keluar");
  const { barangKeluar, riwayatTransaksi } = transaksiData;

  const tabOptions = [
    { value: "keluar", label: lang === "id" ? "Barang Keluar (4 Kategori)" : "Goods Issue", icon: Icons.Outbound },
    { value: "riwayat", label: lang === "id" ? "Riwayat Transaksi Terpadu" : "Unified Ledger", icon: Icons.LedgerUnified },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Transaksi Mutasi & Pengeluaran" : "Inventory Transactions & Dispatches"}
            </h2>
            <Badge variant="yellow" size="sm">
              Double-Entry Ledger
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Pencatatan 4 kategori barang keluar (Fulfillment, Internal Usage, Damaged, Adjustment) dan audit riwayat seluruh jenis transaksi."
              : "Dispatches across 4 categories (Fulfillment, Internal Usage, Damaged, Adjustment) and unified ledger audit."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Ekspor Buku Kas/Stok" : "Export Ledger"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? "Catat Pengeluaran" : "New Goods Issue"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        options={tabOptions}
      />

      {/* TAB 1: BARANG KELUAR (4 KATEGORI) */}
      {activeTab === "keluar" && (
        <div className="space-y-6">
          {/* Quick Category Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-subtle">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">01. Kategori</span>
              <div className="text-sm font-black text-black-primary mt-1">Fulfillment</div>
              <span className="text-[11px] text-text-secondary">Pesanan Marketplace</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-subtle">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">02. Kategori</span>
              <div className="text-sm font-black text-black-primary mt-1">Internal Usage</div>
              <span className="text-[11px] text-text-secondary">Seragam, Kru &amp; Operasional</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-subtle">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">03. Kategori</span>
              <div className="text-sm font-black text-accent-red mt-1">Damaged</div>
              <span className="text-[11px] text-text-secondary">Karantina Cacat &amp; Scrap</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border-subtle">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">04. Kategori</span>
              <div className="text-sm font-black text-black-primary mt-1">Adjustment</div>
              <span className="text-[11px] text-text-secondary">Koreksi Selisih Opname</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Log Pengeluaran Barang Keluar" : "Goods Issue Transactions"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Kategori: Fulfillment, Internal Usage, Damaged, Adjustment"
                    : "Categories: Fulfillment, Internal Usage, Damaged, Adjustment"}
                </CardDescription>
              </div>
              <Badge variant="neutral">{barangKeluar.length} Catatan Keluar</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                    <tr>
                      <th className="p-3">ID Transaksi</th>
                      <th className="p-3">Kategori Keluar</th>
                      <th className="p-3">Keterangan / Tujuan</th>
                      <th className="p-3">Total Unit</th>
                      <th className="p-3">Petugas (PIC)</th>
                      <th className="p-3">Waktu Transaksi</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-text-primary">
                    {barangKeluar.map((item) => (
                      <tr key={item.txId} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                        <td className="p-3 font-mono font-bold text-black-primary">
                          {item.txId}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              item.kategori === "Damaged"
                                ? "red"
                                : item.kategori === "Fulfillment"
                                ? "yellow"
                                : "neutral"
                            }
                            dot={item.kategori === "Damaged"}
                            size="sm"
                          >
                            {item.kategori}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium text-black-primary max-w-sm">
                          {item.keterangan}
                        </td>
                        <td className="p-3 font-mono font-bold text-black-primary">
                          -{item.totalPcs} pcs
                        </td>
                        <td className="p-3 text-text-secondary">{item.pic}</td>
                        <td className="p-3 font-mono text-[11px] text-text-muted">{item.tanggal}</td>
                        <td className="p-3 text-right">
                          <Badge variant="neutral" size="sm">{item.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: RIWAYAT TRANSAKSI TERPADU (4 JENIS) */}
      {activeTab === "riwayat" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Riwayat Transaksi Terpadu (Audit Trail)" : "Unified Transaction Audit Trail"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Jenis Transaksi: Incoming Transaction, Outgoing Transaction, Return Transaction, Production Transaction"
                  : "Transaction Types: Incoming Transaction, Outgoing Transaction, Return Transaction, Production Transaction"}
              </CardDescription>
            </div>
            <Badge variant="yellow" size="sm">Sinkron 100%</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Trx ID</th>
                    <th className="p-3">Jenis Transaksi</th>
                    <th className="p-3">No. Referensi</th>
                    <th className="p-3">Deskripsi Transaksi</th>
                    <th className="p-3">Quantity Delta</th>
                    <th className="p-3">Pihak Terkait</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {riwayatTransaksi.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.id}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={item.tipeBadge}
                          dot={item.tipeBadge === "red"}
                          size="sm"
                        >
                          {item.jenisTransaksi}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-[11px] font-bold text-accent-yellow-hover">
                        {item.referensi}
                      </td>
                      <td className="p-3 text-black-primary max-w-xs">{item.deskripsi}</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={item.quantity.startsWith("+") ? "text-accent-yellow-hover font-bold" : "text-black-primary"}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-text-secondary">{item.pihakTerkait}</td>
                      <td className="p-3 text-right font-mono text-[11px] text-text-muted">
                        {item.tanggal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

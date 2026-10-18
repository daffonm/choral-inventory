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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Icons,
  SkeletonTable,
  EmptyState,
} from "@/components/ui";
import { useAppConfig } from "@/providers/AppProvider";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";

export default function TransaksiView({ lang: propLang, initialTab = "keluar" }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [userTab, setUserTab] = useState(null);
  const activeTab = userTab || initialTab;
  const setActiveTab = setUserTab;

  // Realtime Firestore subscription
  const { data: transactions, loading: loadingTx, isLive } = useRealtimeCollection("transactions");
  const { data: movements, loading: loadingMovements } = useRealtimeCollection("stock_movements");

  const barangKeluar = React.useMemo(() => {
    return transactions.filter(
      (item) => item.category === "barang_keluar" || item.txId || item.totalPcs || Number(item.quantity) < 0
    );
  }, [transactions]);

  const riwayatTransaksi = React.useMemo(() => {
    if (movements.length > 0) {
      return movements.map((m) => ({
        id: m.movementId || m.id,
        jenisTransaksi: m.transactionType || (m.quantity >= 0 ? "Incoming Transaction" : "Outgoing Transaction"),
        referensi: m.referenceTransaction || `REF-${m.id.slice(0, 6)}`,
        deskripsi: m.reason || `${m.transactionType} untuk SKU ${m.sku}`,
        quantity: `${m.quantity > 0 ? "+" : ""}${m.quantity} Pcs`,
        pihakTerkait: m.source || "Gudang Utama",
        tanggal: m.timestamp?.seconds ? new Date(m.timestamp.seconds * 1000).toLocaleString("id-ID") : String(m.timestamp || "-"),
        tipeBadge: m.quantity > 0 ? "yellow" : "neutral",
      }));
    }
    return transactions.filter((t) => t.category === "riwayat_transaksi" || t.jenisTransaksi);
  }, [transactions, movements]);

  const loading = loadingTx && loadingMovements;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Transaksi Mutasi & Pengeluaran" : "Inventory Transactions & Dispatches"}
            </h2>
            <Badge variant={isLive ? "yellow" : "neutral"} size="sm" dot={isLive}>
              {isLive ? "Live Ledger" : "Menghubungkan..."}
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

      {/* TAB 1: BARANG KELUAR (4 KATEGORI) */}
      {activeTab === "keluar" && (
        <div className="flex flex-col gap-6">
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

          {loading ? (
            <SkeletonTable rows={5} columns={7} />
          ) : (
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
                {barangKeluar.length === 0 ? (
                  <EmptyState
                    icon={Icons.Outbound}
                    title="Belum Ada Log Barang Keluar"
                    description="Koleksi transaksi barang keluar masih kosong. Pengeluaran stok akibat order atau mutasi internal akan tampil di sini."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Transaksi</TableHead>
                        <TableHead>Kategori Keluar</TableHead>
                        <TableHead>Keterangan / Tujuan</TableHead>
                        <TableHead>Total Unit</TableHead>
                        <TableHead>Petugas (PIC)</TableHead>
                        <TableHead>Waktu Transaksi</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {barangKeluar.map((item) => (
                        <TableRow key={item.txId || item.id}>
                          <TableCell className="font-mono font-bold text-black-primary">
                            {item.txId || item.id}
                          </TableCell>
                          <TableCell>
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
                              {item.kategori || "Outbound"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-black-primary max-w-sm">
                            {item.keterangan || item.reason || "-"}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-black-primary">
                            -{Math.abs(item.totalPcs || item.quantity || 0)} pcs
                          </TableCell>
                          <TableCell className="text-text-secondary">{item.pic || item.user || "Staf Gudang"}</TableCell>
                          <TableCell className="font-mono text-[11px] text-text-muted">{item.waktu || item.timestamp || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="neutral" size="sm">{item.status || "Posted"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: RIWAYAT TRANSAKSI (4 JENIS) */}
      {activeTab === "riwayat" && (
        loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Buku Besar Riwayat Transaksi" : "General Transaction Ledger"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Audit riwayat 4 jenis transaksi: Incoming, Outgoing, Return, Production"
                    : "Audit trail of 4 transaction types: Incoming, Outgoing, Return, Production"}
                </CardDescription>
              </div>
              <Badge variant="yellow" size="sm">{riwayatTransaksi.length} Entri Pembukuan</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {riwayatTransaksi.length === 0 ? (
                <EmptyState
                  icon={Icons.AuditClipboard}
                  title="Belum Ada Riwayat Transaksi"
                  description="Buku mutasi transaksi masih kosong. Setiap transaksi logistik akan otomatis tercatat secara permanen (immutable)."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Jenis Transaksi</TableHead>
                      <TableHead>Referensi Dokumen</TableHead>
                      <TableHead>Deskripsi Aktivitas</TableHead>
                      <TableHead>Quantity Mutasi</TableHead>
                      <TableHead>Pihak Terkait</TableHead>
                      <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riwayatTransaksi.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.tipeBadge || "neutral"} size="sm">
                            {item.jenisTransaksi}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] font-semibold text-text-primary">
                          {item.referensi}
                        </TableCell>
                        <TableCell className="text-text-secondary max-w-sm">{item.deskripsi}</TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-text-secondary">{item.pihakTerkait}</TableCell>
                        <TableCell className="text-right font-mono text-[11px] text-text-muted">
                          {item.tanggal}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

export { TransaksiView };

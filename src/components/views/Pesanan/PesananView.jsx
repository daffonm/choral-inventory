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

export default function PesananView({ lang: propLang, initialTab = "daftar" }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [userTab, setUserTab] = useState(null);
  const activeTab = userTab || initialTab;
  const setActiveTab = setUserTab;

  // Realtime Firestore subscription
  const { data: allOrders, loading, isLive } = useRealtimeCollection("orders");

  const daftarPesanan = React.useMemo(() => {
    return allOrders.filter(
      (item) => item.status !== "Completed" && item.status !== "Cancelled"
    );
  }, [allOrders]);

  const riwayatPesanan = React.useMemo(() => {
    return allOrders.filter(
      (item) => item.status === "Completed" || item.status === "Cancelled" || item.status === "Delivered"
    );
  }, [allOrders]);

  // Hitung jumlah order realtime di tiap tahapan fulfillment
  const fulfillmentStages = React.useMemo(() => {
    const stageDefs = [
      { id: "STAGE_1", name: "1. Order Masuk", desc: "Pesanan baru sinkronisasi otomatis dari marketplace", key: "Order Created" },
      { id: "STAGE_2", name: "2. Alokasi Stok", desc: "Sistem mengunci stok fisik (reserved stock) per SKU", key: "Allocated" },
      { id: "STAGE_3", name: "3. Cetak Label & Resi", desc: "Thermal barcode shipping label siap dicetak", key: "Label Printed" },
      { id: "STAGE_4", name: "4. Picking (Ambil Barang)", desc: "Pengambilan unit dari rack penyimpanan gudang", key: "Picking" },
      { id: "STAGE_5", name: "5. Packing & QC Akhir", desc: "Pengepakan polymailer/kardus dengan segel QC", key: "Packing" },
      { id: "STAGE_6", name: "6. Handover Kurir", desc: "Paket diserahkan ke 3PL logistik (J&T, SiCepat, SPX)", key: "Shipped" },
    ];

    return stageDefs.map((def) => {
      const count = allOrders.filter(
        (o) => (o.status || "").toLowerCase().includes(def.key.toLowerCase()) || (o.stageId === def.id)
      ).length;
      return {
        stageId: def.id,
        name: def.name,
        desc: def.desc,
        count,
        badgeVariant: count > 0 ? "yellow" : "neutral",
      };
    });
  }, [allOrders]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Pesanan & Proses Fulfillment" : "Orders & Fulfillment Logistics"}
            </h2>
            <Badge variant={isLive ? "yellow" : "neutral"} size="sm" dot={isLive}>
              {isLive ? "Live Sync" : "Menghubungkan..."}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Orkestrasi order marketplace (Shopee, TikTok Shop, B2B), alur fulfillment 6 tahapan, dan arsip riwayat pesanan."
              : "Order orchestration across channels, 6-stage warehouse fulfillment pipeline, and completed order history."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Print Label Thermal" : "Bulk Print Labels"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? "Buat Order Manual" : "Manual Order"}
          </Button>
        </div>
      </div>

      {/* TAB 1: DAFTAR PESANAN */}
      {activeTab === "daftar" && (
        loading ? (
          <SkeletonTable rows={5} columns={8} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Daftar Pesanan Aktif" : "Active Orders Queue"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: Order ID, marketplace, channel, SKU, quantity, status"
                    : "Attributes: Order ID, marketplace, channel, SKU, quantity, status"}
                </CardDescription>
              </div>
              <Badge variant="yellow" size="sm">{daftarPesanan.length} Pesanan Diproses</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {daftarPesanan.length === 0 ? (
                <EmptyState
                  icon={Icons.FulfillmentTruck}
                  title="Tidak Ada Antrean Pesanan Aktif"
                  description="Koleksi orders di Firestore masih kosong. Pesanan masuk dari marketplace atau manual order akan tampil di sini."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Marketplace</TableHead>
                      <TableHead>Channel Penjualan</TableHead>
                      <TableHead>SKU Pesanan</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Customer &amp; Kurir</TableHead>
                      <TableHead>Waktu Pesan</TableHead>
                      <TableHead className="text-right">Status Fulfillment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarPesanan.map((item) => (
                      <TableRow key={item.orderId || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.orderId || item.id}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.marketplace || item.channel || "Direct"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral" size="sm">{item.channel || "Marketplace"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] font-bold text-accent-yellow-hover">
                          {item.sku || "-"}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.quantity || 1} pcs
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-black-primary">{item.customer || "Pelanggan"}</div>
                          <div className="text-[10px] text-text-muted font-mono">{item.kurir || "Reguler"}</div>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-text-secondary">
                          {item.waktuPesan || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              (item.status || "").includes("Waiting") || (item.status || "").includes("Picking") || (item.status || "").includes("Packing")
                                ? "yellow"
                                : "neutral"
                            }
                            dot
                            size="sm"
                          >
                            {item.status || "Pending"}
                          </Badge>
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

      {/* TAB 2: PROSES FULFILLMENT (6 TAHAPAN) */}
      {activeTab === "fulfillment" && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  {lang === "id" ? "Alur Proses Fulfillment 6 Tahapan" : "6-Stage Fulfillment Pipeline"}
                </CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Tahapan baku operasional: Order Created → Waiting Fulfillment → Picking → Packing → Shipped → Completed"
                    : "Standard warehouse process: Order Created → Waiting Fulfillment → Picking → Packing → Shipped → Completed"}
                </CardDescription>
              </div>
              <Badge variant="yellow" size="sm">{daftarPesanan.length} Antrean Aktif</Badge>
            </CardHeader>
            <CardContent>
              {/* Pipeline Grid of 6 Stages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fulfillmentStages.map((stage, idx) => (
                  <div
                    key={stage.stageId}
                    className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle hover:border-accent-yellow/40 transition-[border-color] duration-150 ease-out flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-text-muted">
                          TAHAP 0{idx + 1}
                        </span>
                        <Badge variant={stage.badgeVariant} size="sm">
                          {stage.count} Pesanan
                        </Badge>
                      </div>
                      <h4 className="text-sm font-black text-black-primary mt-2">
                        {stage.name}
                      </h4>
                      <p className="text-[11px] text-text-secondary mt-1">
                        {stage.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                      <span className="text-[10px] font-mono text-text-muted">
                        SLA Target: &lt; 2 Jam
                      </span>
                      <Button variant="ghost" size="xs">
                        Lihat Antrean →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: RIWAYAT PESANAN */}
      {activeTab === "riwayat" && (
        loading ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Riwayat Pesanan Selesai" : "Completed Orders History"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: order ID, produk, channel, status, tanggal"
                    : "Attributes: order ID, product, channel, status, date"}
                </CardDescription>
              </div>
              <Badge variant="neutral">{riwayatPesanan.length} Arsip Pesanan</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {riwayatPesanan.length === 0 ? (
                <EmptyState
                  icon={Icons.CheckCircle}
                  title="Belum Ada Arsip Riwayat Pesanan"
                  description="Pesanan yang telah berhasil dikirim atau diselesaikan akan diarsipkan di sini."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Channel Pembelian</TableHead>
                      <TableHead>Nilai Transaksi</TableHead>
                      <TableHead>Tanggal Selesai</TableHead>
                      <TableHead>Rating / Bukti</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riwayatPesanan.map((item) => (
                      <TableRow key={item.orderId || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.orderId || item.id}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.produk || item.namaProduk}
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral" size="sm">{item.channel || "Direct"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.nilaiTransaksi || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.tanggal || item.completedAt || "-"}</TableCell>
                        <TableCell className="text-[11px] text-text-muted">{item.rating || "5.0 ★"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="neutral" size="sm">{item.status || "Completed"}</Badge>
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

export { PesananView };

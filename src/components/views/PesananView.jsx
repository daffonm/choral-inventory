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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Icons,
} from "../ui";
import { useAppConfig } from "../providers/AppProvider";
import { pesananData } from "../../lib/dummyData";

export default function PesananView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("daftar");
  const { daftarPesanan, fulfillmentStages, riwayatPesanan } = pesananData;

  const tabOptions = [
    { value: "daftar", label: lang === "id" ? "Daftar Pesanan" : "Orders List", icon: Icons.Orders },
    { value: "fulfillment", label: lang === "id" ? "Proses Fulfillment" : "Fulfillment Pipeline", icon: Icons.PipelineFulfillment },
    { value: "riwayat", label: lang === "id" ? "Riwayat Pesanan" : "Order History", icon: Icons.OrderHistory },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Pesanan & Proses Fulfillment" : "Orders & Fulfillment Logistics"}
            </h2>
            <Badge variant="yellow" size="sm">
              Multi-Marketplace Sync
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

      {/* Tabs */}
      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        options={tabOptions}
      />

      {/* TAB 1: DAFTAR PESANAN */}
      {activeTab === "daftar" && (
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
                  <TableRow key={item.orderId}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.orderId}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.marketplace}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{item.channel}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] font-bold text-accent-yellow-hover">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.quantity} pcs
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-black-primary">{item.customer}</div>
                      <div className="text-[10px] text-text-muted font-mono">{item.kurir}</div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-text-secondary">
                      {item.waktuPesan}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          item.status === "Completed"
                            ? "neutral"
                            : item.status === "Waiting Fulfillment" || item.status === "Picking" || item.status === "Packing"
                            ? "yellow"
                            : "neutral"
                        }
                        dot={item.status !== "Completed"}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
              <Badge variant="yellow" size="sm">241 Antrean Aktif</Badge>
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
            <Badge variant="neutral">Arsip Pesanan</Badge>
          </CardHeader>
          <CardContent className="p-0">
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
                  <TableRow key={item.orderId}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.orderId}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.produk}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{item.channel}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.nilaiTransaksi}
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">{item.tanggal}</TableCell>
                    <TableCell className="text-[11px] text-text-muted">{item.rating}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="neutral" size="sm">{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

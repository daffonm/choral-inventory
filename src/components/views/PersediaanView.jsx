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
import { persediaanData, formatNumber } from "../../lib";

export default function PersediaanView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("stokSaatIni");
  const { stokSaatIni, pergerakanStok, alokasiStok, stockOpname, stokMinimum } = persediaanData;

  const tabOptions = [
    { value: "stokSaatIni", label: lang === "id" ? "Stok Saat Ini" : "Current Stock", icon: Icons.Package },
    { value: "pergerakan", label: lang === "id" ? "Pergerakan Stok" : "Stock Movement", icon: Icons.MovementLedger },
    { value: "alokasi", label: lang === "id" ? "Alokasi Stok" : "Channel Allocation", icon: Icons.AllocationPool },
    { value: "opname", label: lang === "id" ? "Stock Opname" : "Stock Audit", icon: Icons.StockOpname },
    { value: "minimum", label: lang === "id" ? "Stok Minimum" : "Buffer Alerts", icon: Icons.AlertBuffer },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Persediaan & Kontrol Inventaris" : "Inventory & Stock Control"}
            </h2>
            <Badge variant="yellow" size="sm">
              Live Physical Audit
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Status stok realtime, kartu log mutasi pergerakan, alokasi multi-channel, selisih stock opname, dan peringatan buffer."
              : "Real-time stock levels, movement ledger, multi-channel allocations, stock take audits, and minimum threshold alerts."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Unduh Kartu Stok" : "Download Stock Card"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? "Catat Mutasi / Opname" : "New Stock Adjustment"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        options={tabOptions}
      />

      {/* TAB 1: STOK SAAT INI */}
      {activeTab === "stokSaatIni" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Stok Saat Ini (Per SKU)" : "Current Stock On-Hand"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: SKU, total stock, available stock, reserved stock, damaged stock"
                  : "Attributes: SKU, total stock, available stock, reserved stock, damaged stock"}
              </CardDescription>
            </div>
            <Badge variant="yellow" size="sm">Real-time Stock</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Nama Produk</th>
                    <th className="p-3">Lokasi Gudang</th>
                    <th className="p-3 text-right">Total Stock</th>
                    <th className="p-3 text-right">Available Stock</th>
                    <th className="p-3 text-right">Reserved Stock</th>
                    <th className="p-3 text-right">Damaged Stock</th>
                    <th className="p-3 text-right">Status Kesehatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {stokSaatIni.map((item) => (
                    <tr key={item.sku} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.sku}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.namaProduk}
                      </td>
                      <td className="p-3 text-text-secondary font-mono text-[11px]">
                        {item.lokasiGudang}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-black-primary">
                        {formatNumber(item.totalStock)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-accent-yellow-hover">
                        {formatNumber(item.availableStock)}
                      </td>
                      <td className="p-3 text-right font-mono text-text-secondary">
                        {formatNumber(item.reservedStock)}
                      </td>
                      <td className="p-3 text-right font-mono text-accent-red font-semibold">
                        {formatNumber(item.damagedStock)}
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={item.statusKesehatan.includes("Kritis") ? "red" : "yellow"}
                          dot
                          size="sm"
                        >
                          {item.statusKesehatan}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: PERGERAKAN STOK */}
      {activeTab === "pergerakan" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Buku Mutasi & Pergerakan Stok" : "Stock Movement Audit Ledger"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: Movement ID, Transaction Type, SKU, Quantity, Source, Reason, User, Timestamp, Reference Transaction"
                  : "Attributes: Movement ID, Transaction Type, SKU, Quantity, Source, Reason, User, Timestamp, Reference Transaction"}
              </CardDescription>
            </div>
            <Badge variant="neutral">Immutable Log</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Movement ID</th>
                    <th className="p-3">Transaction Type</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Source / Asal</th>
                    <th className="p-3">Reason / Keterangan</th>
                    <th className="p-3">Petugas (User)</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Ref. Trx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {pergerakanStok.map((item) => (
                    <tr key={item.movementId} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.movementId}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            item.transactionType.includes("Incoming")
                              ? "yellow"
                              : item.transactionType.includes("Damaged")
                              ? "red"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {item.transactionType}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono font-semibold text-black-primary">
                        {item.sku}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        <span className={item.quantity > 0 ? "text-accent-yellow-hover" : "text-black-primary"}>
                          {item.quantity > 0 ? `+${item.quantity}` : item.quantity} pcs
                        </span>
                      </td>
                      <td className="p-3 text-text-secondary">{item.source}</td>
                      <td className="p-3 text-text-primary max-w-xs">{item.reason}</td>
                      <td className="p-3 font-mono text-[11px] text-text-muted">{item.user}</td>
                      <td className="p-3 font-mono text-[11px] text-text-secondary">{item.timestamp}</td>
                      <td className="p-3 font-mono text-[11px] font-bold text-accent-yellow-hover">
                        {item.referenceTransaction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: ALOKASI STOK */}
      {activeTab === "alokasi" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Alokasi Stok Multi-Channel" : "Omnichannel Stock Allocation"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: produk, channel, quantity"
                  : "Attributes: product, channel, quantity"}
              </CardDescription>
            </div>
            <Badge variant="yellow" size="sm">Channel Lock Pool</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Produk</th>
                    <th className="p-3">Channel Distribusi</th>
                    <th className="p-3">Quantity Alokasi</th>
                    <th className="p-3">Persentase Pool</th>
                    <th className="p-3 text-right">Status Sinkronisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {alokasiStok.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-semibold text-black-primary">
                        {item.produk}
                      </td>
                      <td className="p-3 font-bold text-black-primary">
                        {item.channel}
                      </td>
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.quantity} pcs
                      </td>
                      <td className="p-3 font-mono text-text-secondary">{item.persentase}</td>
                      <td className="p-3 text-right">
                        <Badge variant="yellow" dot size="sm">{item.statusSync}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: STOCK OPNAME */}
      {activeTab === "opname" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Hasil Audit Stock Opname Fisik" : "Physical Stock Opname & Audit"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: SKU, system stock, physical stock, difference, adjustment"
                  : "Attributes: SKU, system stock, physical stock, difference, adjustment"}
              </CardDescription>
            </div>
            <Badge variant="neutral">Audit Triwulan</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Nama Produk</th>
                    <th className="p-3 text-right">System Stock</th>
                    <th className="p-3 text-right">Physical Stock</th>
                    <th className="p-3 text-right">Difference (Selisih)</th>
                    <th className="p-3">Penyesuaian / Adjustment</th>
                    <th className="p-3">Auditor</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {stockOpname.map((item) => (
                    <tr key={item.sku} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.sku}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.namaProduk}
                      </td>
                      <td className="p-3 text-right font-mono text-text-secondary">
                        {item.systemStock} pcs
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-black-primary">
                        {item.physicalStock} pcs
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className={item.difference < 0 ? "text-accent-red" : item.difference > 0 ? "text-accent-yellow-hover" : "text-text-muted"}>
                          {item.difference > 0 ? `+${item.difference}` : item.difference} pcs
                        </span>
                      </td>
                      <td className="p-3 text-text-secondary max-w-xs">{item.adjustment}</td>
                      <td className="p-3 font-mono text-[11px] text-text-muted">{item.auditor}</td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={item.difference === 0 ? "yellow" : "neutral"}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: STOK MINIMUM */}
      {activeTab === "minimum" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Batas Minimum Stok & Reorder Point" : "Minimum Stock & Reorder Triggers"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: SKU, current stock, minimum stock, status"
                  : "Attributes: SKU, current stock, minimum stock, status"}
              </CardDescription>
            </div>
            <Badge variant="red" dot size="sm">Safety Buffer Gate</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">SKU / Kode</th>
                    <th className="p-3">Nama Item</th>
                    <th className="p-3 text-right">Current Stock</th>
                    <th className="p-3 text-right">Minimum Stock Buffer</th>
                    <th className="p-3">Rekomendasi Tindakan Reorder</th>
                    <th className="p-3 text-right">Status Buffer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {stokMinimum.map((item) => (
                    <tr key={item.sku} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.sku}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.namaProduk}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className={item.currentStock < item.minimumStock ? "text-accent-red font-black" : "text-black-primary"}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-text-secondary">
                        {item.minimumStock}
                      </td>
                      <td className="p-3 text-text-secondary">{item.reorderPoint}</td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={item.priority === "high" ? "red" : item.priority === "warning" ? "yellow" : "neutral"}
                          dot={item.priority === "high"}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
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

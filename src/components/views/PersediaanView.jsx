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
    <div className="flex flex-col gap-6">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Lokasi Gudang</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead className="text-right">Available Stock</TableHead>
                  <TableHead className="text-right">Reserved Stock</TableHead>
                  <TableHead className="text-right">Damaged Stock</TableHead>
                  <TableHead className="text-right">Status Kesehatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stokSaatIni.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.namaProduk}
                    </TableCell>
                    <TableCell className="text-text-secondary font-mono text-[11px]">
                      {item.lokasiGudang}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-black-primary">
                      {formatNumber(item.totalStock)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-accent-yellow-hover">
                      {formatNumber(item.availableStock)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-text-secondary">
                      {formatNumber(item.reservedStock)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-accent-red font-semibold">
                      {formatNumber(item.damagedStock)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.statusKesehatan.includes("Kritis") ? "red" : "yellow"}
                        dot
                        size="sm"
                      >
                        {item.statusKesehatan}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movement ID</TableHead>
                  <TableHead>Transaction Type</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Source / Asal</TableHead>
                  <TableHead>Reason / Keterangan</TableHead>
                  <TableHead>Petugas (User)</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Ref. Trx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pergerakanStok.map((item) => (
                  <TableRow key={item.movementId}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.movementId}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-black-primary">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      <span className={item.quantity > 0 ? "text-accent-yellow-hover" : "text-black-primary"}>
                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity} pcs
                      </span>
                    </TableCell>
                    <TableCell className="text-text-secondary">{item.source}</TableCell>
                    <TableCell className="text-text-primary max-w-xs">{item.reason}</TableCell>
                    <TableCell className="font-mono text-[11px] text-text-muted">{item.user}</TableCell>
                    <TableCell className="font-mono text-[11px] text-text-secondary">{item.timestamp}</TableCell>
                    <TableCell className="font-mono text-[11px] font-bold text-accent-yellow-hover">
                      {item.referenceTransaction}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Channel Distribusi</TableHead>
                  <TableHead>Quantity Alokasi</TableHead>
                  <TableHead>Persentase Pool</TableHead>
                  <TableHead className="text-right">Status Sinkronisasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alokasiStok.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-black-primary">
                      {item.produk}
                    </TableCell>
                    <TableCell className="font-bold text-black-primary">
                      {item.channel}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.quantity} pcs
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">{item.persentase}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="yellow" dot size="sm">{item.statusSync}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead className="text-right">System Stock</TableHead>
                  <TableHead className="text-right">Physical Stock</TableHead>
                  <TableHead className="text-right">Difference (Selisih)</TableHead>
                  <TableHead>Penyesuaian / Adjustment</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockOpname.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.namaProduk}
                    </TableCell>
                    <TableCell className="text-right font-mono text-text-secondary">
                      {item.systemStock} pcs
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-black-primary">
                      {item.physicalStock} pcs
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      <span className={item.difference < 0 ? "text-accent-red" : item.difference > 0 ? "text-accent-yellow-hover" : "text-text-muted"}>
                        {item.difference > 0 ? `+${item.difference}` : item.difference} pcs
                      </span>
                    </TableCell>
                    <TableCell className="text-text-secondary max-w-xs">{item.adjustment}</TableCell>
                    <TableCell className="font-mono text-[11px] text-text-muted">{item.auditor}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.difference === 0 ? "yellow" : "neutral"}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU / Kode</TableHead>
                  <TableHead>Nama Item</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Minimum Stock Buffer</TableHead>
                  <TableHead>Rekomendasi Tindakan Reorder</TableHead>
                  <TableHead className="text-right">Status Buffer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stokMinimum.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.namaProduk}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      <span className={item.currentStock < item.minimumStock ? "text-accent-red font-black" : "text-black-primary"}>
                        {item.currentStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-text-secondary">
                      {item.minimumStock}
                    </TableCell>
                    <TableCell className="text-text-secondary">{item.reorderPoint}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.priority === "high" ? "red" : item.priority === "warning" ? "yellow" : "neutral"}
                        dot={item.priority === "high"}
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
    </div>
  );
}

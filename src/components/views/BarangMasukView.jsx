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
import { barangMasukData } from "../../lib/dummyData";

export default function BarangMasukView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("supplier");
  const { penerimaanSupplier, hasilProduksi, barangRetur } = barangMasukData;

  const tabOptions = [
    { value: "supplier", label: lang === "id" ? "Penerimaan Supplier" : "Supplier Receipts", icon: Icons.Inbound },
    { value: "produksi", label: lang === "id" ? "Hasil Produksi" : "Production Inbound", icon: Icons.Manufacturing },
    { value: "retur", label: lang === "id" ? "Barang Retur" : "Return Orders", icon: Icons.ReturnOrder },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Inbound & Barang Masuk" : "Inbound Logistics & Goods Receiving"}
            </h2>
            <Badge variant="yellow" size="sm">
              Inbound Ledger
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Catatan penerimaan bahan dari vendor supplier, serah terima hasil jahit produksi, dan inspeksi barang retur."
              : "Logs for raw material deliveries from suppliers, production yield handoffs, and customer return inspections."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Cetak Bukti Masuk" : "Print Goods Receipt"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? "Catat Barang Masuk" : "New Inbound Entry"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        options={tabOptions}
      />

      {/* TAB 1: PENERIMAAN SUPPLIER */}
      {activeTab === "supplier" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Penerimaan Bahan Baku dari Supplier" : "Supplier Material Inbounds"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: nomor penerimaan, supplier, tanggal, produk/material, quantity, status penerimaan"
                  : "Attributes: receipt number, supplier, date, product/material, quantity, receipt status"}
              </CardDescription>
            </div>
            <Badge variant="neutral">{penerimaanSupplier.length} Dokumen Penerimaan</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Nomor Penerimaan</th>
                    <th className="p-3">Supplier Vendor</th>
                    <th className="p-3">Tanggal Masuk</th>
                    <th className="p-3">Produk / Material</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Lokasi Gudang</th>
                    <th className="p-3">Status Penerimaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {penerimaanSupplier.map((item) => (
                    <tr key={item.nomorPenerimaan} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.nomorPenerimaan}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.supplier}
                      </td>
                      <td className="p-3 font-mono text-text-secondary">{item.tanggal}</td>
                      <td className="p-3 text-text-primary">{item.produkMaterial}</td>
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-text-muted">{item.lokasiGudang}</td>
                      <td className="p-3">
                        <Badge
                          variant={item.statusPenerimaan.includes("Lengkap") ? "yellow" : "neutral"}
                          dot
                          size="sm"
                        >
                          {item.statusPenerimaan}
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

      {/* TAB 2: HASIL PRODUKSI */}
      {activeTab === "produksi" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Serah Terima Hasil Produksi ke Gudang" : "Production Yield Inbound"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: production ID, produk, quantity, status QC"
                  : "Attributes: production ID, product, quantity, QC status"}
              </CardDescription>
            </div>
            <Badge variant="yellow" size="sm">Siap Masuk Stok</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Production ID</th>
                    <th className="p-3">Produk Jadi</th>
                    <th className="p-3">Batch Code</th>
                    <th className="p-3">Tanggal Masuk</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Tujuan Gudang</th>
                    <th className="p-3 text-right">Status QC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {hasilProduksi.map((item) => (
                    <tr key={item.productionId} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.productionId}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.produk}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-text-muted">
                        {item.batchCode}
                      </td>
                      <td className="p-3 font-mono text-text-secondary">{item.tanggalMasuk}</td>
                      <td className="p-3 font-mono font-bold text-black-primary">
                        +{item.quantity} pcs
                      </td>
                      <td className="p-3 text-text-secondary">{item.tujuanGudang}</td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={item.statusQC === "Passed" ? "yellow" : "red"}
                          dot
                          size="sm"
                        >
                          {item.statusQC}
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

      {/* TAB 3: BARANG RETUR */}
      {activeTab === "retur" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Log Barang Retur & Penanganan QC" : "Customer Returns & QC Resolution"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: return ID, produk, quantity, status QC, keputusan retur"
                  : "Attributes: return ID, product, quantity, QC status, return decision"}
              </CardDescription>
            </div>
            <Badge variant="red" size="sm">QC Gate</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Return ID</th>
                    <th className="p-3">Produk</th>
                    <th className="p-3">Channel Asal</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Alasan Customer</th>
                    <th className="p-3">Status QC</th>
                    <th className="p-3">Keputusan Retur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {barangRetur.map((item) => (
                    <tr key={item.returnId} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.returnId}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.produk}
                      </td>
                      <td className="p-3">
                        <Badge variant="neutral" size="sm">{item.channelAsal}</Badge>
                      </td>
                      <td className="p-3 font-mono font-bold">{item.quantity} pcs</td>
                      <td className="p-3 text-text-secondary italic">&ldquo;{item.alasanCustomer}&rdquo;</td>
                      <td className="p-3">
                        <Badge
                          variant={item.statusQC === "Passed" ? "yellow" : "red"}
                          dot
                          size="sm"
                        >
                          {item.statusQC}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-black-primary">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          item.statusQC === "Passed"
                            ? "bg-accent-yellow-surface text-black-primary border border-accent-yellow-border"
                            : "bg-accent-red-surface text-accent-red border border-accent-red-border"
                        }`}>
                          {item.keputusanRetur}
                        </span>
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

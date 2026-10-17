"use client";

import React, { useState, useEffect } from "react";
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
} from "../ui";
import { useAppConfig } from "../../providers/AppProvider";
import { barangMasukData } from "@/lib/dummyData";

export default function BarangMasukView({ lang: propLang, initialTab = "supplier" }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [userTab, setUserTab] = useState(null);
  const activeTab = userTab || initialTab;
  const setActiveTab = setUserTab;
  const { penerimaanSupplier, hasilProduksi, barangRetur } = barangMasukData;

  return (
    <div className="flex flex-col gap-6">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Penerimaan</TableHead>
                  <TableHead>Supplier Vendor</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead>Produk / Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Lokasi Gudang</TableHead>
                  <TableHead>Status Penerimaan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {penerimaanSupplier.map((item) => (
                  <TableRow key={item.nomorPenerimaan}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.nomorPenerimaan}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.supplier}
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">{item.tanggal}</TableCell>
                    <TableCell className="text-text-primary">{item.produkMaterial}</TableCell>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-text-muted">{item.lokasiGudang}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.statusPenerimaan.includes("Lengkap") ? "yellow" : "neutral"}
                        dot
                        size="sm"
                      >
                        {item.statusPenerimaan}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Production ID</TableHead>
                  <TableHead>Produk Jadi</TableHead>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Tanggal Masuk</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Tujuan Gudang</TableHead>
                  <TableHead className="text-right">Status QC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasilProduksi.map((item) => (
                  <TableRow key={item.productionId}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.productionId}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.produk}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-text-muted">
                      {item.batchCode}
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">{item.tanggalMasuk}</TableCell>
                    <TableCell className="font-mono font-bold text-black-primary">
                      +{item.quantity} pcs
                    </TableCell>
                    <TableCell className="text-text-secondary">{item.tujuanGudang}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.statusQC === "Passed" ? "yellow" : "red"}
                        dot
                        size="sm"
                      >
                        {item.statusQC}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return ID</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Channel Asal</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Alasan Customer</TableHead>
                  <TableHead>Status QC</TableHead>
                  <TableHead>Keputusan Retur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barangRetur.map((item) => (
                  <TableRow key={item.returnId}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.returnId}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.produk}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{item.channelAsal}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold">{item.quantity} pcs</TableCell>
                    <TableCell className="text-text-secondary italic">&ldquo;{item.alasanCustomer}&rdquo;</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.statusQC === "Passed" ? "yellow" : "red"}
                        dot
                        size="sm"
                      >
                        {item.statusQC}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-black-primary">
                      <Badge
                        variant={item.statusQC === "Passed" ? "yellow" : "red"}
                        size="sm"
                      >
                        {item.keputusanRetur}
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

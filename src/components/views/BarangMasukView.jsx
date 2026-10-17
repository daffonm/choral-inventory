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
} from "../ui";
import { useAppConfig } from "../../providers/AppProvider";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";

export default function BarangMasukView({ lang: propLang, initialTab = "supplier" }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [userTab, setUserTab] = useState(null);
  const activeTab = userTab || initialTab;
  const setActiveTab = setUserTab;

  // Realtime Firestore subscription
  const { data: allInbound, loading, isLive } = useRealtimeCollection("incoming_goods");

  const penerimaanSupplier = allInbound.filter(
    (item) => item.type === "supplier" || item.nomorPenerimaan || (!item.type && !item.productionId && !item.noRetur)
  );
  const hasilProduksi = allInbound.filter(
    (item) => item.type === "produksi" || item.productionId
  );
  const barangRetur = allInbound.filter(
    (item) => item.type === "retur" || item.noRetur
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Inbound & Barang Masuk" : "Inbound Logistics & Goods Receiving"}
            </h2>
            <Badge variant={isLive ? "yellow" : "neutral"} size="sm" dot={isLive}>
              {isLive ? "Live Inbound" : "Menghubungkan..."}
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
        loading ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
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
              {penerimaanSupplier.length === 0 ? (
                <EmptyState
                  icon={Icons.SupplierTruck}
                  title="Belum Ada Penerimaan Supplier"
                  description="Koleksi incoming_goods di Firestore masih kosong. Data penerimaan supplier akan tercatat saat diinput atau di-seed."
                />
              ) : (
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
                      <TableRow key={item.nomorPenerimaan || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.nomorPenerimaan || item.id}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.supplier || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.tanggal || "-"}</TableCell>
                        <TableCell className="text-text-primary">{item.produkMaterial || "-"}</TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.quantity || "0"}
                        </TableCell>
                        <TableCell className="text-text-muted">{item.lokasiGudang || "Gudang Utama"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={(item.statusPenerimaan || "").includes("Lengkap") ? "yellow" : "neutral"}
                            dot
                            size="sm"
                          >
                            {item.statusPenerimaan || "Diterima"}
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

      {/* TAB 2: HASIL PRODUKSI */}
      {activeTab === "produksi" && (
        loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
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
              <Badge variant="yellow" size="sm">{hasilProduksi.length} Batch Masuk</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {hasilProduksi.length === 0 ? (
                <EmptyState
                  icon={Icons.Package}
                  title="Belum Ada Hasil Produksi Masuk"
                  description="Belum ada serah terima barang jadi dari lantai jahit/workshop ke gudang penyimpanan."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Production ID</TableHead>
                      <TableHead>Produk Jadi</TableHead>
                      <TableHead>Tanggal Selesai</TableHead>
                      <TableHead>Quantity Jadi</TableHead>
                      <TableHead>Pemeriksa QC</TableHead>
                      <TableHead className="text-right">Status QC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hasilProduksi.map((item) => (
                      <TableRow key={item.productionId || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.productionId || item.id}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.produk}
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.tanggal}</TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-text-muted">{item.qcInspector || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={(item.statusQc || "").includes("Passed") ? "yellow" : "neutral"}
                            dot
                            size="sm"
                          >
                            {item.statusQc || "Inspected"}
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

      {/* TAB 3: BARANG RETUR */}
      {activeTab === "retur" && (
        loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Barang Retur Konsumen & Marketplace" : "Returns & Claims Inspection"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: no retur, asal channel, alasan retur, kondisi fisik, tindak lanjut"
                    : "Attributes: return ID, channel source, return reason, physical condition, disposition"}
                </CardDescription>
              </div>
              <Badge variant="red" size="sm">{barangRetur.length} Retur Masuk</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {barangRetur.length === 0 ? (
                <EmptyState
                  icon={Icons.HistoryMove}
                  title="Belum Ada Catatan Barang Retur"
                  description="Tidak ada paket retur barang yang masuk untuk diinspeksi."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Retur</TableHead>
                      <TableHead>Channel Marketplace</TableHead>
                      <TableHead>SKU &amp; Produk</TableHead>
                      <TableHead>Alasan Retur</TableHead>
                      <TableHead>Kondisi Fisik</TableHead>
                      <TableHead className="text-right">Disposisi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {barangRetur.map((item) => (
                      <TableRow key={item.noRetur || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.noRetur || item.id}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.channel}
                        </TableCell>
                        <TableCell className="text-text-primary">{item.produk}</TableCell>
                        <TableCell className="text-text-secondary text-xs">{item.alasan}</TableCell>
                        <TableCell>
                          <Badge variant={(item.kondisi || "").includes("Rusak") ? "red" : "neutral"} size="sm">
                            {item.kondisi || "Inspected"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-black-primary">
                          {item.disposisi || "-"}
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

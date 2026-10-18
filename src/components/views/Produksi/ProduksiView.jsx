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
  Progress,
  SegmentedControl,
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

export default function ProduksiView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("daftar");

  // Realtime Firestore subscription
  const { data: daftarProduksi, loading, isLive } = useRealtimeCollection("production_orders");

  // Derive sub-reports dari daftar SPK produksi
  const penggunaanMaterial = React.useMemo(() => {
    return daftarProduksi
      .filter((item) => item.material)
      .map((item) => ({
        productionId: item.productionId || item.noSpk || item.id,
        material: item.material || "Bahan Utama",
        quantityDigunakan: item.quantityDigunakan || `${item.targetQuantity * 1.2} Meter`,
        standarKonsumsi: item.standarKonsumsi || "1.2 Meter/pcs",
        toleransiLimbah: item.toleransiLimbah || "2.5% (Toleransi Aman)",
      }));
  }, [daftarProduksi]);

  const qcProduksi = React.useMemo(() => {
    return daftarProduksi
      .filter((item) => item.qcStatus || item.statusQc)
      .map((item) => ({
        qcId: `QC-${item.productionId || item.id}`,
        productionId: item.productionId || item.noSpk || item.id,
        produk: item.produk || item.namaProduk,
        sampleInspected: item.sampleInspected || Math.round((item.targetQuantity || 50) * 0.1),
        status: item.qcStatus || item.statusQc || "Passed",
        reason: item.qcReason || "Lolos uji jahitan & ketahanan bahan",
        qcInspector: item.qcInspector || "Quality Inspector",
      }));
  }, [daftarProduksi]);

  const hasilProduksiSummary = React.useMemo(() => {
    return daftarProduksi
      .filter((item) => item.progress === 100 || item.status?.includes("Completed"))
      .map((item) => ({
        produkJadi: item.produk || item.namaProduk,
        sku: item.sku || "CHR-SKU",
        quantity: item.targetQuantity || 0,
        statusOutput: "Masuk Inventory",
        tglPenyelesaian: item.estimasiSelesai || item.tanggalSelesai || "Selesai",
        tujuanAlokasi: "Gudang Utama",
      }));
  }, [daftarProduksi]);

  const tabOptions = [
    { value: "daftar", label: lang === "id" ? "Daftar Produksi" : "Production Batches", icon: Icons.WorkOrder },
    { value: "material", label: lang === "id" ? "Penggunaan Material" : "Material Consumption", icon: Icons.MaterialFabric },
    { value: "qc", label: lang === "id" ? "QC Produksi" : "Quality Control", icon: Icons.QualityControl },
    { value: "output", label: lang === "id" ? "Hasil Produksi" : "Finished Yields", icon: Icons.Package },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Manajemen Produksi & Semi-Mfg" : "Manufacturing & Production Floor"}
            </h2>
            <Badge variant={isLive ? "yellow" : "neutral"} size="sm" dot={isLive}>
              {isLive ? "Live Production" : "Menghubungkan..."}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Monitoring SPK produksi jahit, alokasi konsumsi bahan baku, gate Quality Control, dan output produk jadi."
              : "Track sewing work orders, bill-of-materials usage, quality control checks, and finished product yields."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Cetak Kartu SPK" : "Print Work Orders"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? "Buat Batch Produksi" : "New Production Batch"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <SegmentedControl
        value={activeTab}
        onChange={setActiveTab}
        options={tabOptions}
      />

      {/* TAB 1: DAFTAR PRODUKSI */}
      {activeTab === "daftar" && (
        loading ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Daftar Perintah Kerja & Batch Produksi" : "Active Production Batches"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: production ID, produk, target quantity, tanggal produksi, status"
                    : "Attributes: production ID, product, target quantity, production date, status"}
                </CardDescription>
              </div>
              <Badge variant="yellow" size="sm">{daftarProduksi.length} SPK Terdaftar</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {daftarProduksi.length === 0 ? (
                <EmptyState
                  icon={Icons.WorkOrder}
                  title="Belum Ada Batch Produksi Aktif"
                  description="Koleksi production_orders di Firestore masih kosong. Buat Surat Perintah Kerja (SPK) baru untuk memulai lini jahit."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Production ID</TableHead>
                      <TableHead>Nama Produk Jadi</TableHead>
                      <TableHead>Target Qty</TableHead>
                      <TableHead>Tanggal Mulai</TableHead>
                      <TableHead>Estimasi Selesai</TableHead>
                      <TableHead>Progress Jahit</TableHead>
                      <TableHead className="text-right">Status Produksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarProduksi.map((item) => (
                      <TableRow key={item.productionId || item.noSpk || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.productionId || item.noSpk || item.id}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.produk || item.namaProduk}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.targetQuantity} pcs
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.tanggalProduksi || item.tanggalMulai || "-"}</TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.estimasiSelesai || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 w-24">
                            <Progress value={item.progress || 0} />
                            <span className="text-[10px] font-mono text-text-muted block">
                              {item.progress || 0}% selesai
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              (item.status || "").includes("Completed")
                                ? "neutral"
                                : (item.status || "").includes("Running")
                                  ? "yellow"
                                  : "neutral"
                            }
                            dot={(item.status || "").includes("Running")}
                            size="sm"
                          >
                            {item.status || "Planned"}
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

      {/* TAB 2: PENGGUNAAN MATERIAL */}
      {activeTab === "material" && (
        loading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Penggunaan Material & Bill of Materials (BOM)" : "Material Consumption Logs"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: production ID, material, quantity digunakan"
                    : "Attributes: production ID, material, quantity consumed"}
                </CardDescription>
              </div>
              <Badge variant="neutral">{penggunaanMaterial.length} Log BOM</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {penggunaanMaterial.length === 0 ? (
                <EmptyState
                  icon={Icons.MaterialFabric}
                  title="Belum Ada Alokasi Material"
                  description="Catatan konsumsi bahan baku akan terbuat otomatis saat SPK produksi dijadwalkan."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Production ID</TableHead>
                      <TableHead>Material Digunakan</TableHead>
                      <TableHead>Quantity Digunakan</TableHead>
                      <TableHead>Standar Konsumsi / Pcs</TableHead>
                      <TableHead className="text-right">Toleransi Limbah Scrap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {penggunaanMaterial.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.productionId}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.material}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.quantityDigunakan}
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.standarKonsumsi}</TableCell>
                        <TableCell className="text-right font-mono text-accent-yellow-hover font-semibold">
                          {item.toleransiLimbah}
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

      {/* TAB 3: QC PRODUKSI */}
      {activeTab === "qc" && (
        loading ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Hasil Inspeksi QC Produksi" : "Quality Control Inspection"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: Pending, Passed, Failed, Reason"
                    : "Attributes: Pending, Passed, Failed, Reason"}
                </CardDescription>
              </div>
              <Badge variant="yellow" size="sm">{qcProduksi.length} Audit QC</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {qcProduksi.length === 0 ? (
                <EmptyState
                  icon={Icons.QualityControl}
                  title="Belum Ada Data Inspeksi QC"
                  description="Inspeksi mutu produk akan tercatat saat batch produksi masuk ke gerbang Quality Control."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>QC ID</TableHead>
                      <TableHead>Production ID</TableHead>
                      <TableHead>Produk Diinspeksi</TableHead>
                      <TableHead>Sampel Diuji</TableHead>
                      <TableHead>Status QC</TableHead>
                      <TableHead>Catatan / Reason</TableHead>
                      <TableHead>QC Inspector</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qcProduksi.map((item) => (
                      <TableRow key={item.qcId}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.qcId}
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">
                          {item.productionId}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.produk}
                        </TableCell>
                        <TableCell className="font-mono">{item.sampleInspected} pcs</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "Passed"
                                ? "yellow"
                                : item.status === "Failed"
                                  ? "red"
                                  : "neutral"
                            }
                            dot
                            size="sm"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-text-secondary max-w-xs">{item.reason}</TableCell>
                        <TableCell className="font-mono text-text-muted">{item.qcInspector}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* TAB 4: HASIL PRODUKSI */}
      {activeTab === "output" && (
        loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Output Hasil Produksi Jadi" : "Finished Goods Production Yields"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: produk jadi, quantity, status output"
                    : "Attributes: finished product, quantity, output status"}
                </CardDescription>
              </div>
              <Badge variant="neutral">{hasilProduksiSummary.length} Batch Selesai</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {hasilProduksiSummary.length === 0 ? (
                <EmptyState
                  icon={Icons.Package}
                  title="Belum Ada Hasil Produksi Jadi"
                  description="Batch yang telah mencapai status 100% / Selesai akan tampil di sini untuk serah terima ke inventaris gudang."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk Jadi</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity Siap Jual</TableHead>
                      <TableHead>Status Output</TableHead>
                      <TableHead>Tanggal Penyelesaian</TableHead>
                      <TableHead>Tujuan Alokasi Gudang</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hasilProduksiSummary.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-bold text-black-primary">
                          {item.produkJadi}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-text-secondary">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          +{item.quantity} pcs
                        </TableCell>
                        <TableCell>
                          <Badge variant="yellow" size="sm">{item.statusOutput}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.tglPenyelesaian}</TableCell>
                        <TableCell className="text-text-secondary">{item.tujuanAlokasi}</TableCell>
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

export { ProduksiView };

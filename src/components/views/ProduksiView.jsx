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
} from "../ui";
import { useAppConfig } from "../../providers/AppProvider";
import { produksiData } from "@/lib/dummyData";

export default function ProduksiView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("daftar");
  const { daftarProduksi, penggunaanMaterial, qcProduksi, hasilProduksiSummary } = produksiData;

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
            <Badge variant="yellow" size="sm">
              Workshop Cimahi
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
            <Badge variant="yellow" size="sm">5 SPK Terdaftar</Badge>
          </CardHeader>
          <CardContent className="p-0">
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
                  <TableRow key={item.productionId}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.productionId}
                    </TableCell>
                    <TableCell className="font-semibold text-black-primary">
                      {item.produk}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.targetQuantity} pcs
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">{item.tanggalProduksi}</TableCell>
                    <TableCell className="font-mono text-text-secondary">{item.estimasiSelesai}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 w-24">
                        <Progress value={item.progress} />
                        <span className="text-[10px] font-mono text-text-muted block">
                          {item.progress}% selesai
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          item.status.includes("Completed")
                            ? "neutral"
                            : item.status.includes("Running")
                              ? "yellow"
                              : "neutral"
                        }
                        dot={item.status.includes("Running")}
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

      {/* TAB 2: PENGGUNAAN MATERIAL */}
      {activeTab === "material" && (
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
            <Badge variant="neutral">BOM Consumption</Badge>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      )}

      {/* TAB 3: QC PRODUKSI */}
      {activeTab === "qc" && (
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
            <Badge variant="yellow" size="sm">QC Gate 100%</Badge>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      )}

      {/* TAB 4: HASIL PRODUKSI */}
      {activeTab === "output" && (
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
            <Badge variant="neutral">Distribusi Selesai</Badge>
          </CardHeader>
          <CardContent className="p-0">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

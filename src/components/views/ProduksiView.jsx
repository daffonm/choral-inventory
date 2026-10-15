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
import { produksiData } from "../../lib/dummyData";

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
    <div className="space-y-6">
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Production ID</th>
                    <th className="p-3">Nama Produk Jadi</th>
                    <th className="p-3">Target Qty</th>
                    <th className="p-3">Tanggal Mulai</th>
                    <th className="p-3">Estimasi Selesai</th>
                    <th className="p-3">Progress Jahit</th>
                    <th className="p-3 text-right">Status Produksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {daftarProduksi.map((item) => (
                    <tr key={item.productionId} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.productionId}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.produk}
                      </td>
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.targetQuantity} pcs
                      </td>
                      <td className="p-3 font-mono text-text-secondary">{item.tanggalProduksi}</td>
                      <td className="p-3 font-mono text-text-secondary">{item.estimasiSelesai}</td>
                      <td className="p-3">
                        <div className="w-24 bg-surface-muted h-2 rounded-full overflow-hidden border border-border-subtle">
                          <div
                            style={{ width: `${item.progress}%` }}
                            className="bg-accent-yellow h-full transition-[width] duration-300 ease-[var(--ease-out)]"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-text-muted mt-0.5 block">
                          {item.progress}% selesai
                        </span>
                      </td>
                      <td className="p-3 text-right">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Production ID</th>
                    <th className="p-3">Material Digunakan</th>
                    <th className="p-3">Quantity Digunakan</th>
                    <th className="p-3">Standar Konsumsi / Pcs</th>
                    <th className="p-3 text-right">Toleransi Limbah Scrap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {penggunaanMaterial.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.productionId}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.material}
                      </td>
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.quantityDigunakan}
                      </td>
                      <td className="p-3 font-mono text-text-secondary">{item.standarKonsumsi}</td>
                      <td className="p-3 text-right font-mono text-accent-yellow-hover font-semibold">
                        {item.toleransiLimbah}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">QC ID</th>
                    <th className="p-3">Production ID</th>
                    <th className="p-3">Produk Diinspeksi</th>
                    <th className="p-3">Sampel Diuji</th>
                    <th className="p-3">Status QC</th>
                    <th className="p-3">Catatan / Reason</th>
                    <th className="p-3">QC Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {qcProduksi.map((item) => (
                    <tr key={item.qcId} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.qcId}
                      </td>
                      <td className="p-3 font-mono text-text-secondary">
                        {item.productionId}
                      </td>
                      <td className="p-3 font-semibold text-black-primary">
                        {item.produk}
                      </td>
                      <td className="p-3 font-mono">{item.sampleInspected} pcs</td>
                      <td className="p-3">
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
                      </td>
                      <td className="p-3 text-text-secondary max-w-xs">{item.reason}</td>
                      <td className="p-3 font-mono text-text-muted">{item.qcInspector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Produk Jadi</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Quantity Siap Jual</th>
                    <th className="p-3">Status Output</th>
                    <th className="p-3">Tanggal Penyelesaian</th>
                    <th className="p-3">Tujuan Alokasi Gudang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {hasilProduksiSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-bold text-black-primary">
                        {item.produkJadi}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-text-secondary">
                        {item.sku}
                      </td>
                      <td className="p-3 font-mono font-bold text-black-primary">
                        +{item.quantity} pcs
                      </td>
                      <td className="p-3">
                        <Badge variant="yellow" size="sm">{item.statusOutput}</Badge>
                      </td>
                      <td className="p-3 font-mono text-text-secondary">{item.tglPenyelesaian}</td>
                      <td className="p-3 text-text-secondary">{item.tujuanAlokasi}</td>
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

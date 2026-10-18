"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
  Icons,
} from "@/components/ui";
import { useAppConfig } from "@/providers/AppProvider";
import { createMasterWarehouse } from "@/lib/services/inventory-service";
import { cn } from "@/lib/utils/utils";

const TIPE_GUDANG_OPTIONS = [
  "Gudang Produk Jadi (Finished Goods)",
  "Gudang Bahan Baku & Material Mentah",
  "Hub Logistik & Fulfillment Cepat",
  "Workshop Produksi & Quality Control (QC)",
  "Gudang Karantina, Cacat & Retur",
  "Buffer Gudang Event & Bazaar",
];

const PRESET_WAREHOUSES = [
  {
    nama: "Gudang Utama Pusat (DC Bandung)",
    kode: "GDG-BDG-01",
    tipe: "Gudang Produk Jadi (Finished Goods)",
    lokasi: "Jl. Soekarno Hatta No. 428, Bandung, Jawa Barat",
    rack: "Area A1-A6 (Tas Jadi), Area B1-B4 (Material Bahan)",
    kapasitas: "25,000 Pcs",
    pic: "Budi Santoso",
    telepon: "0812-4567-8900",
  },
  {
    nama: "Warehouse Hub Jakarta Barat",
    kode: "GDG-JKT-02",
    tipe: "Hub Logistik & Fulfillment Cepat",
    lokasi: "Komp. Pergudangan Daan Mogot KM 12, Jakarta Barat",
    rack: "Area F1-F4 (Fast Moving Online Shopee/TikTok)",
    kapasitas: "10,000 Pcs",
    pic: "Reza Fahmi",
    telepon: "0813-8901-2345",
  },
  {
    nama: "Workshop Produksi & QC Cimahi",
    kode: "GDG-CMH-03",
    tipe: "Workshop Produksi & Quality Control (QC)",
    lokasi: "Kawasan Industri Cimahi Selatan, Cimahi",
    rack: "Area WIP-01 (Cutting), WIP-02 (Sewing), Area QC",
    kapasitas: "5,000 Pcs / WIP",
    pic: "Agus Supriyadi",
    telepon: "0856-7890-3456",
  },
  {
    nama: "Buffer Gudang Transit Event & Bazaar",
    kode: "GDG-EVT-04",
    tipe: "Buffer Gudang Event & Bazaar",
    lokasi: "Jl. LLRE Martadinata (Riau) No. 89, Bandung",
    rack: "Rack E1-E2 (Display Stock & Rolling Event)",
    kapasitas: "2,000 Pcs",
    pic: "Andi Wijaya",
    telepon: "0818-1234-5678",
  },
];

export default function TambahGudangView({
  onBack,
  onSuccess,
  existingCodes = new Set(),
  lang: propLang,
}) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";

  const [loading, setLoading] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    kodeGudang: "",
    namaGudang: "",
    tipeGudang: "Gudang Produk Jadi (Finished Goods)",
    lokasiPenyimpanan: "",
    rackArea: "Area A1-A4 (Main Rack)",
    kapasitasMax: "10,000 Pcs",
    penanggungJawab: "",
    telepon: "",
    status: "Operational",
    catatan: "",
  });

  const cleanCode = String(formData.kodeGudang || "").trim().toUpperCase();
  const isDuplicateCode = Boolean(cleanCode && existingCodes.has(cleanCode));
  const isCodeValid = Boolean(cleanCode && !isDuplicateCode && cleanCode.length >= 3);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      kodeGudang: preset.kode,
      namaGudang: preset.nama,
      tipeGudang: preset.tipe,
      lokasiPenyimpanan: preset.lokasi,
      rackArea: preset.rack,
      kapasitasMax: preset.kapasitas,
      penanggungJawab: preset.pic,
      telepon: preset.telepon,
      status: "Operational",
      catatan: `Fasilitas pergudangan terverifikasi: ${preset.nama}`,
    });
    setErrorMessage("");
  };

  const handleAutoGenerateCode = () => {
    const prefix = "GDG";
    const randomHex = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${randomHex}`;
    handleChange("kodeGudang", newCode);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.namaGudang.trim()) {
      setErrorMessage("Nama fasilitas gudang wajib diisi.");
      return;
    }
    if (isDuplicateCode) {
      setErrorMessage(`Kode Gudang ${cleanCode} sudah terdaftar. Gunakan kode lain.`);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await createMasterWarehouse(formData);
      if (res.success) {
        setSuccessSaved(true);
        if (onSuccess) onSuccess(res.kodeGudang);
      } else {
        setErrorMessage(res.error || "Gagal menyimpan data gudang ke Firestore.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan internal saat menyimpan fasilitas gudang.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-slot="tambah-gudang-view"
      className="animate-view-slide-in-right flex flex-col gap-6 w-full pb-16 text-black-primary"
    >
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            icon={Icons.ArrowLeft}
            title={lang === "id" ? "Kembali ke Master Data" : "Back to Master Catalog"}
            className="shrink-0"
          >
            {lang === "id" ? "Kembali" : "Back"}
          </Button>

          <div className="h-5 w-px bg-border-default" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black-primary">
                {lang === "id" ? "Tambah Fasilitas Gudang & Rack" : "Add Warehouse & Rack Storage"}
              </h2>
              <Badge variant="yellow" size="sm">
                Master Warehouses
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Daftarkan fasilitas gudang fisik, denah pembagian rack, kapasitas penyimpanan, dan penanggung jawab (PIC)."
                : "Register warehouse facilities, storage rack divisions, capacity limits, and head personnel."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>
            {lang === "id" ? "Batal" : "Cancel"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={loading ? Icons.Loader : Icons.Check}
            onClick={handleSubmit}
            disabled={loading || isDuplicateCode || successSaved}
            className={cn("min-w-[130px]", loading && "animate-pulse")}
          >
            {loading
              ? lang === "id"
                ? "Menyimpan..."
                : "Saving..."
              : lang === "id"
              ? "Simpan Fasilitas"
              : "Save Facility"}
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successSaved && (
        <div className="p-4 rounded-xl bg-accent-yellow/15 border border-accent-yellow/40 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-accent-yellow/30 flex items-center justify-center text-accent-yellow-hover">
              <Icons.CheckCircle className="size-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-black-primary">
                Gudang {formData.namaGudang} Berhasil Didaftarkan!
              </p>
              <p className="text-text-secondary">
                Fasilitas penyimpanan telah terintegrasi untuk penempatan rack SKU produk dan bahan baku.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="xs" onClick={onBack}>
              Kembali ke Denah
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={() => {
                setFormData({
                  kodeGudang: "",
                  namaGudang: "",
                  tipeGudang: "Gudang Produk Jadi (Finished Goods)",
                  lokasiPenyimpanan: "",
                  rackArea: "Area A1-A4 (Main Rack)",
                  kapasitasMax: "10,000 Pcs",
                  penanggungJawab: "",
                  telepon: "",
                  status: "Operational",
                  catatan: "",
                });
                setSuccessSaved(false);
              }}
            >
              + Tambah Gudang Lagi
            </Button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/30 flex items-start gap-2.5 text-xs text-accent-red">
          <Icons.AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Quick Template Presets */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
            <Icons.Zap className="size-3.5 text-accent-yellow" />
            Template Denah Gudang Standar CHORAL:
          </span>
          <span className="text-[11px] text-text-muted">Klik untuk mengisi template contoh</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_WAREHOUSES.map((p) => (
            <button
              key={p.kode}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted/80 hover:border-accent-yellow/40 transition-all text-left flex flex-col gap-1"
            >
              <span className="text-[10px] font-mono font-bold text-accent-yellow-hover">
                {p.kode}
              </span>
              <span className="text-xs font-bold text-black-primary truncate">
                {p.nama}
              </span>
              <span className="text-[10px] text-text-muted truncate">
                Kapasitas: {p.kapasitas} &bull; {p.pic}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Spesifikasi Gudang (2 Span) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Spesifikasi Fasilitas &amp; Denah Rack</CardTitle>
                <CardDescription>
                  Nama gudang, klasifikasi tipe operasional, penomoran zona rack, dan alamat fisik fasilitas.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Row 1: Kode & Nama Gudang */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black-primary">
                      Kode Gudang
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateCode}
                      className="text-[10px] font-bold text-accent-yellow-hover hover:underline flex items-center gap-1"
                    >
                      <Icons.Zap className="size-3" /> Auto
                    </button>
                  </div>
                  <Input
                    value={formData.kodeGudang}
                    onChange={(e) => handleChange("kodeGudang", e.target.value.toUpperCase())}
                    placeholder="GDG-..."
                    className={cn(
                      "font-mono font-bold uppercase",
                      isDuplicateCode && "border-accent-red text-accent-red"
                    )}
                  />
                  {isDuplicateCode && (
                    <span className="text-[10px] text-accent-red font-medium">Sudah digunakan!</span>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">
                    Nama Fasilitas Gudang <span className="text-accent-red">*</span>
                  </label>
                  <Input
                    value={formData.namaGudang}
                    onChange={(e) => handleChange("namaGudang", e.target.value)}
                    placeholder="cth: Gudang Utama Pusat (DC Bandung)"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Tipe Gudang Card Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Tipe &amp; Fungsi Fasilitas Gudang <span className="text-accent-red">*</span>
                  </label>
                  <span className="text-[11px] text-text-muted">Pilih klasifikasi operasional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIPE_GUDANG_OPTIONS.map((opt) => {
                    const isSelected = formData.tipeGudang === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange("tipeGudang", opt)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2",
                          isSelected
                            ? "bg-accent-yellow/15 border-accent-yellow text-black-primary font-bold shadow-sm ring-1 ring-accent-yellow/30"
                            : "bg-surface-muted/40 border-border-default text-text-secondary hover:bg-surface-muted hover:border-border-hover"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold">{opt}</span>
                          <span className="text-[10px] text-text-muted">
                            {opt.includes("Produk Jadi")
                              ? "Penyimpanan ransel, tas, dan waistbag siap kirim"
                              : opt.includes("Bahan Baku")
                              ? "Gudang material kain roll, webbing, hardware & zipper"
                              : opt.includes("Hub Logistik")
                              ? "Transit packing cepat ekspedisi & marketplace"
                              : opt.includes("Workshop")
                              ? "Pola potong, sewing jahit, dan stasiun QC"
                              : opt.includes("Karantina")
                              ? "Pemisahan barang cacat, klaim vendor, dan retur"
                              : "Stok rolling pameran & event outdoor"}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="size-2 rounded-full bg-accent-yellow shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Denah Rack & Alokasi Zona */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Denah Zona / Alokasi Rack Penyimpanan <span className="text-accent-red">*</span>
                </label>
                <Input
                  value={formData.rackArea}
                  onChange={(e) => handleChange("rackArea", e.target.value)}
                  placeholder="cth: Area A1-A6 (Finished Goods), Area B1-B4 (Raw Materials)"
                  required
                />
                <span className="text-[10px] text-text-muted">
                  Gunakan pemisah koma untuk mendefinisikan lorong atau kode baris rack.
                </span>
              </div>

              {/* Row 4: Alamat Fisik Gudang */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Alamat Fisik Gudang
                </label>
                <textarea
                  value={formData.lokasiPenyimpanan}
                  onChange={(e) => handleChange("lokasiPenyimpanan", e.target.value)}
                  rows={2}
                  placeholder="cth: Jl. Soekarno Hatta No. 428, Bandung, Jawa Barat (Akses Kontainer 40ft)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow resize-none leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Kapasitas & Personel (1 Span) */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Kapasitas &amp; Personel PIC</CardTitle>
                <CardDescription>
                  Batas volume penyimpanan dan penanggung jawab operasional harian.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Kapasitas Maksimum */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Kapasitas Maksimal Unit
                </label>
                <Input
                  value={formData.kapasitasMax}
                  onChange={(e) => handleChange("kapasitasMax", e.target.value)}
                  placeholder="cth: 25,000 Pcs"
                  className="font-medium"
                />
              </div>

              {/* Penanggung Jawab / PIC */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Kepala Gudang / PIC
                </label>
                <Input
                  value={formData.penanggungJawab}
                  onChange={(e) => handleChange("penanggungJawab", e.target.value)}
                  placeholder="cth: Budi Santoso"
                />
              </div>

              {/* No Telepon Gudang */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  No. Telepon / Hotline Gudang
                </label>
                <Input
                  value={formData.telepon}
                  onChange={(e) => handleChange("telepon", e.target.value)}
                  placeholder="cth: 0812-4567-8900"
                />
              </div>

              {/* Status Operasional: Segmented Buttons */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-black-primary">
                  Status Operasional
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: "Operational", label: "Normal", sub: "Aktif", dot: "bg-emerald-500" },
                    { value: "Maintenance / Stock Opname", label: "Opname", sub: "Audit", dot: "bg-accent-yellow" },
                    { value: "Full Capacity", label: "Penuh", sub: "Max", dot: "bg-accent-red" },
                  ].map((st) => {
                    const isSelected = formData.status === st.value;
                    return (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => handleChange("status", st.value)}
                        className={cn(
                          "p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5",
                          isSelected
                            ? "bg-surface-card border-accent-yellow ring-1 ring-accent-yellow/30 shadow-sm"
                            : "bg-surface-muted/40 border-border-default hover:bg-surface-muted text-text-secondary"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={cn("size-2 rounded-full", st.dot)} />
                          <span className={cn("text-xs font-bold", isSelected ? "text-black-primary" : "text-text-secondary")}>
                            {st.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted">{st.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-mono">
                Status: {formData.status}
              </span>
              <Button
                variant="primary"
                size="sm"
                icon={loading ? Icons.Loader : Icons.Check}
                onClick={handleSubmit}
                disabled={loading || isDuplicateCode || successSaved}
              >
                {loading ? "Menyimpan..." : "Simpan Gudang"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}

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
import { createMasterMaterial } from "@/lib/services/inventory-service";
import { cn, formatNumber } from "@/lib/utils/utils";

const JENIS_MATERIAL_OPTIONS = [
  "Bahan Utama (Kain)",
  "Aksesoris & Ritsleting",
  "Hardware / Aksesoris Plastik",
  "Tali & Webbing",
  "Bahan Furing Dalam",
  "Benang Jahit Industri",
  "Packaging & Label",
];

const SATUAN_OPTIONS = ["Meter", "Roll (50m)", "Pcs", "Cone", "Yard", "Lembar"];

const PRESET_MATERIALS = [
  {
    nama: "Cordura 1000D PU Coated Black",
    jenis: "Bahan Utama (Kain)",
    satuan: "Meter",
    kode: "MAT-FAB-CD1000",
    supplier: "PT Sinar Tekstil Mandiri",
    harga: 85000,
    stok: 500,
    min: 50,
    rak: "Rack Kain A1",
  },
  {
    nama: "YKK Aquaguard Zipper No. 5 Matte",
    jenis: "Aksesoris & Ritsleting",
    satuan: "Meter",
    kode: "MAT-ZIP-YKK5WP",
    supplier: "CV Ritsleting Jaya",
    harga: 16500,
    stok: 1000,
    min: 100,
    rak: "Rack Ritsleting R2",
  },
  {
    nama: "Woojin Quick Release Acetal Buckle 25mm",
    jenis: "Hardware / Aksesoris Plastik",
    satuan: "Pcs",
    kode: "MAT-BCK-AC25",
    supplier: "PT Woojin Hardware Perkasa",
    harga: 4500,
    stok: 2500,
    min: 200,
    rak: "Bin Hardware B1",
  },
  {
    nama: "Nylon Seatbelt Webbing Strap 38mm",
    jenis: "Tali & Webbing",
    satuan: "Roll (50m)",
    kode: "MAT-WEB-NYL38",
    supplier: "PT Tali Nusantara",
    harga: 175000,
    stok: 35,
    min: 10,
    rak: "Rack Webbing W3",
  },
];

export default function TambahMaterialView({
  onBack,
  onSuccess,
  existingCodes = new Set(),
  suppliers = [],
  lang: propLang,
}) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";

  const [loading, setLoading] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    kodeMaterial: "",
    namaMaterial: "",
    jenisMaterial: "Bahan Utama (Kain)",
    satuan: "Meter",
    stokTersedia: "100",
    minimumStok: "20",
    hargaPerSatuan: "85000",
    supplierUtama: suppliers[0]?.namaSupplier || "PT Sinar Tekstil Mandiri",
    lokasiRak: "Rack Material M1",
    deskripsi: "",
    status: "Tersedia",
  });

  const cleanCode = String(formData.kodeMaterial || "").trim().toUpperCase();
  const isDuplicateCode = Boolean(cleanCode && existingCodes.has(cleanCode));
  const isCodeValid = Boolean(cleanCode && !isDuplicateCode && cleanCode.length >= 3);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      kodeMaterial: preset.kode,
      namaMaterial: preset.nama,
      jenisMaterial: preset.jenis,
      satuan: preset.satuan,
      stokTersedia: String(preset.stok),
      minimumStok: String(preset.min),
      hargaPerSatuan: String(preset.harga),
      supplierUtama: preset.supplier,
      lokasiRak: preset.rak,
      deskripsi: `Spesifikasi standar operasional lini jahit CHORAL: ${preset.nama}`,
      status: "Tersedia",
    });
    setErrorMessage("");
  };

  const handleAutoGenerateCode = () => {
    const prefix = "MAT";
    const typeCode = formData.jenisMaterial.slice(0, 3).toUpperCase().replace(/\s/g, "");
    const randomHex = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${typeCode}-${randomHex}`;
    handleChange("kodeMaterial", newCode);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.kodeMaterial.trim()) {
      setErrorMessage("Kode material wajib diisi atau klik tombol 'Auto Kode'.");
      return;
    }
    if (isDuplicateCode) {
      setErrorMessage(`Kode Material ${cleanCode} sudah terdaftar. Gunakan kode unik lain.`);
      return;
    }
    if (!formData.namaMaterial.trim()) {
      setErrorMessage("Nama material bahan tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await createMasterMaterial(formData);
      if (res.success) {
        setSuccessSaved(true);
        if (onSuccess) onSuccess(res.kodeMaterial);
      } else {
        setErrorMessage(res.error || "Gagal menyimpan material ke Firestore.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan internal saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-slot="tambah-material-view"
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
                {lang === "id" ? "Tambah Master Material Baru" : "Add New Raw Material"}
              </h2>
              <Badge variant="yellow" size="sm">
                Master Materials
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Daftarkan spesifikasi bahan baku, kain, ritsleting, webbing, dan hardware untuk lini produksi jahit."
                : "Register raw fabrics, zippers, webbing, and hardware for sewing line BOMs."}
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
              ? "Simpan Material"
              : "Save Material"}
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
                Material {cleanCode} Berhasil Didaftarkan!
              </p>
              <p className="text-text-secondary">
                Data telah tersimpan di Firestore dan siap dialokasikan untuk Bill of Materials (BOM) produksi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="xs" onClick={onBack}>
              Kembali ke Tabel
            </Button>
            <Button
              variant="primary"
              size="xs"
              onClick={() => {
                setFormData({
                  kodeMaterial: "",
                  namaMaterial: "",
                  jenisMaterial: "Bahan Utama (Kain)",
                  satuan: "Meter",
                  stokTersedia: "100",
                  minimumStok: "20",
                  hargaPerSatuan: "85000",
                  supplierUtama: suppliers[0]?.namaSupplier || "PT Sinar Tekstil Mandiri",
                  lokasiRak: "Rack Material M1",
                  deskripsi: "",
                  status: "Tersedia",
                });
                setSuccessSaved(false);
              }}
            >
              + Tambah Lagi
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
            Template Cepat Bahan Populer (One-Click Fill):
          </span>
          <span className="text-[11px] text-text-muted">Klik untuk mengisi otomatis</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_MATERIALS.map((p) => (
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
              <span className="text-[10px] text-text-muted">
                Rp {formatNumber(p.harga)} / {p.satuan}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Identitas & Jenis Bahan (2 Span) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Identitas &amp; Klasifikasi Bahan</CardTitle>
                <CardDescription>
                  Kode material, nama bahan, kategori jenis bahan mentah, dan satuan ukur operasional.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Row 1: Kode Material dengan Realtime In-Memory Checker */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Kode Material (Unique Identifier) <span className="text-accent-red">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {cleanCode && (
                      <Badge
                        variant={isDuplicateCode ? "red" : isCodeValid ? "yellow" : "neutral"}
                        size="xs"
                        dot={isDuplicateCode}
                      >
                        {isDuplicateCode ? (
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-accent-red shrink-0" />
                            Sudah Terdaftar
                          </span>
                        ) : isCodeValid ? (
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Kode Tersedia
                          </span>
                        ) : (
                          "Minimal 3 Karakter"
                        )}
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={handleAutoGenerateCode}
                      className="text-[11px] font-bold text-accent-yellow-hover hover:underline flex items-center gap-1"
                    >
                      <Icons.Zap className="size-3" /> Auto Kode
                    </button>
                  </div>
                </div>

                <Input
                  value={formData.kodeMaterial}
                  onChange={(e) => handleChange("kodeMaterial", e.target.value.toUpperCase())}
                  placeholder="cth: MAT-FAB-CD1000 atau MAT-ZIP-YKK5"
                  className={cn(
                    "font-mono font-bold uppercase",
                    isDuplicateCode && "border-accent-red text-accent-red focus:border-accent-red",
                    isCodeValid && "border-accent-yellow focus:border-accent-yellow"
                  )}
                  required
                />
                {isDuplicateCode && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-accent-red">
                    <Icons.AlertTriangle className="size-3.5 shrink-0" />
                    <span>Kode material &quot;{cleanCode}&quot; sudah digunakan oleh bahan lain. Mohon gunakan kode berbeda.</span>
                  </div>
                )}
              </div>

              {/* Row 2: Nama Material */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Nama Lengkap Material <span className="text-accent-red">*</span>
                </label>
                <Input
                  value={formData.namaMaterial}
                  onChange={(e) => handleChange("namaMaterial", e.target.value)}
                  placeholder="cth: Cordura Fabric 1000D PU Coated Matte Black"
                  required
                />
              </div>

              {/* Row 3: Jenis / Kelompok Bahan Button Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Jenis / Kelompok Bahan Mentah <span className="text-accent-red">*</span>
                  </label>
                  <span className="text-[11px] text-text-muted">Pilih klasifikasi material</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {JENIS_MATERIAL_OPTIONS.map((opt) => {
                    const isSelected = formData.jenisMaterial === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange("jenisMaterial", opt)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-left text-xs transition-all flex items-start justify-between gap-1.5",
                          isSelected
                            ? "bg-accent-yellow/15 border-accent-yellow text-black-primary font-bold shadow-sm ring-1 ring-accent-yellow/30"
                            : "bg-surface-muted/40 border-border-default text-text-secondary hover:bg-surface-muted hover:border-border-hover"
                        )}
                      >
                        <span className="leading-snug">{opt}</span>
                        {isSelected && (
                          <span className="size-2 rounded-full bg-accent-yellow shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Satuan Ukuran Operasional Pills Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Satuan Ukuran Operasional <span className="text-accent-red">*</span>
                  </label>
                  <span className="text-[11px] text-text-muted">Pilih unit hitung stok</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SATUAN_OPTIONS.map((s) => {
                    const isSelected = formData.satuan === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleChange("satuan", s)}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-mono font-bold text-center transition-all",
                          isSelected
                            ? "bg-accent-yellow border-accent-yellow text-black-primary shadow-sm ring-1 ring-accent-yellow/30"
                            : "bg-surface-muted/40 border-border-default text-text-secondary hover:bg-surface-muted hover:border-border-hover"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Deskripsi & Spesifikasi Teknis */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Spesifikasi Teknis &amp; Catatan Khusus
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => handleChange("deskripsi", e.target.value)}
                  rows={3}
                  placeholder="cth: Lebar kain 150cm, gramasi 340gsm, water repellent test passed, tahan gesek standar military grade."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow resize-none leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Stok, Harga & Rekanan Supplier (1 Span) */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Stok Awal &amp; Biaya Bahan</CardTitle>
                <CardDescription>
                  Parameter saldo awal persediaan bahan dan harga beli standar per satuan.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Stok Awal */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Stok Awal Tersedia ({formData.satuan})
                  </label>
                  <span className="text-[10px] text-text-muted">Gudang Bahan Mentah</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={formData.stokTersedia}
                  onChange={(e) => handleChange("stokTersedia", e.target.value)}
                  className="font-mono font-bold"
                />
              </div>

              {/* Minimum Stok Buffer */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Batas Minimum Stok (Threshold)
                  </label>
                  <span className="text-[10px] text-text-muted">Peringatan Menipis</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={formData.minimumStok}
                  onChange={(e) => handleChange("minimumStok", e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Harga per Satuan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Harga Beli / Satuan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-text-muted font-mono">Rp</span>
                  <Input
                    type="number"
                    min="0"
                    value={formData.hargaPerSatuan}
                    onChange={(e) => handleChange("hargaPerSatuan", e.target.value)}
                    className="pl-9 font-mono font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Supplier Rekanan Utama */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Mitra Supplier Utama
                </label>
                <select
                  value={formData.supplierUtama}
                  onChange={(e) => handleChange("supplierUtama", e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow"
                >
                  {suppliers.length > 0 ? (
                    suppliers.map((s) => (
                      <option key={s.kodeSupplier || s.id || s.namaSupplier} value={s.namaSupplier}>
                        {s.namaSupplier}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="PT Sinar Tekstil Mandiri">PT Sinar Tekstil Mandiri</option>
                      <option value="CV Ritsleting Jaya">CV Ritsleting Jaya</option>
                      <option value="PT Woojin Hardware Perkasa">PT Woojin Hardware Perkasa</option>
                      <option value="PT Tali Nusantara">PT Tali Nusantara</option>
                    </>
                  )}
                </select>
              </div>

              {/* Lokasi Rak / Gudang Bahan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Lokasi Rak / Penyimpanan
                </label>
                <Input
                  value={formData.lokasiRak}
                  onChange={(e) => handleChange("lokasiRak", e.target.value)}
                  placeholder="cth: Rack Material M1, Bin B3"
                  className="text-xs font-medium"
                />
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
                {loading ? "Menyimpan..." : "Simpan Material"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}

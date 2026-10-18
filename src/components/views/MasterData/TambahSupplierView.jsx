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
import { createMasterSupplier } from "@/lib/services/inventory-service";
import { cn } from "@/lib/utils/utils";

const KATEGORI_SUPPLIER_OPTIONS = [
  "Kain Cordura, Ripstop & Canvas",
  "Ritsleting, Slider & Puller Custom",
  "Hardware Plastik, Buckle & D-Ring",
  "Tali Webbing & Seatbelt Strap",
  "Benang Jahit Industri & Bordir",
  "Aksesoris Logam & Snap Button",
  "Packaging, Polymailer & Box Karton",
  "Bahan Busa, Polyfoam & Padding",
];

const TOP_OPTIONS = [
  "COD / Bayar Saat Barang Tiba",
  "Net 7 Hari",
  "Net 14 Hari",
  "Net 30 Hari",
  "DP 50% & Pelunasan Sebelum Kirim",
];

const PRESET_SUPPLIERS = [
  {
    nama: "PT Sinar Tekstil Mandiri",
    kode: "SUP-TX-01",
    jenis: "Kain Cordura, Ripstop & Canvas",
    kota: "Bandung, Jawa Barat",
    kontak: "+62 812-4567-8901",
    pic: "Sinaga",
    leadTime: "3-5 Hari",
    top: "Net 30 Hari",
  },
  {
    nama: "CV Ritsleting Jaya Abadi",
    kode: "SUP-ZIP-02",
    jenis: "Ritsleting, Slider & Puller Custom",
    kota: "Jakarta Barat",
    kontak: "+62 813-9876-5432",
    pic: "Hendrawan",
    leadTime: "2-4 Hari",
    top: "Net 14 Hari",
  },
  {
    nama: "PT Woojin Hardware Perkasa",
    kode: "SUP-HW-03",
    jenis: "Hardware Plastik, Buckle & D-Ring",
    kota: "Tangerang, Banten",
    kontak: "+62 811-3322-1100",
    pic: "Kevin Tan",
    leadTime: "5-7 Hari",
    top: "Net 30 Hari",
  },
  {
    nama: "PT Tali Nusantara Global",
    kode: "SUP-WEB-04",
    jenis: "Tali Webbing & Seatbelt Strap",
    kota: "Solo, Jawa Tengah",
    kontak: "+62 856-7890-1234",
    pic: "Yuli",
    leadTime: "4-6 Hari",
    top: "Net 14 Hari",
  },
];

export default function TambahSupplierView({
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
    kodeSupplier: "",
    namaSupplier: "",
    kontakSupplier: "",
    pic: "",
    jenisBarangSupplier: "Kain Cordura, Ripstop & Canvas",
    kota: "Bandung, Jawa Barat",
    alamat: "",
    telepon: "",
    email: "",
    leadTime: "3-5 Hari",
    termOfPayment: "Net 30 Hari",
    status: "Aktif",
  });

  const cleanCode = String(formData.kodeSupplier || "").trim().toUpperCase();
  const isDuplicateCode = Boolean(cleanCode && existingCodes.has(cleanCode));
  const isCodeValid = Boolean(cleanCode && !isDuplicateCode && cleanCode.length >= 3);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      kodeSupplier: preset.kode,
      namaSupplier: preset.nama,
      kontakSupplier: `${preset.pic} (${preset.kontak})`,
      pic: preset.pic,
      telepon: preset.kontak,
      email: `sales@${preset.nama.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      jenisBarangSupplier: preset.jenis,
      kota: preset.kota,
      alamat: `Kawasan Pergudangan Industri, ${preset.kota}`,
      leadTime: preset.leadTime,
      termOfPayment: preset.top,
      status: "Aktif",
    });
    setErrorMessage("");
  };

  const handleAutoGenerateCode = () => {
    const prefix = "SUP";
    const randomHex = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${randomHex}`;
    handleChange("kodeSupplier", newCode);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.namaSupplier.trim()) {
      setErrorMessage("Nama supplier atau vendor wajib diisi.");
      return;
    }
    if (isDuplicateCode) {
      setErrorMessage(`Kode Supplier ${cleanCode} sudah terdaftar. Gunakan kode lain.`);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await createMasterSupplier({
        ...formData,
        kontakSupplier: formData.kontakSupplier || `${formData.pic} (${formData.telepon || "-"}) - ${formData.email || ""}`,
      });

      if (res.success) {
        setSuccessSaved(true);
        if (onSuccess) onSuccess(res.kodeSupplier);
      } else {
        setErrorMessage(res.error || "Gagal mendaftarkan supplier.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan internal saat mendaftarkan supplier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-slot="tambah-supplier-view"
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
                {lang === "id" ? "Daftarkan Mitra Supplier Baru" : "Register New Vendor & Supplier"}
              </h2>
              <Badge variant="yellow" size="sm">
                Master Suppliers
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Kelola database rekanan vendor kain, resleting, buckle, webbing, dan waktu pengerjaan (lead time)."
                : "Manage vendors for fabrics, zippers, buckles, webbing, and production lead times."}
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
                ? "Mendaftarkan..."
                : "Saving..."
              : lang === "id"
              ? "Daftarkan Supplier"
              : "Save Supplier"}
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
                Supplier {formData.namaSupplier} Berhasil Didaftarkan!
              </p>
              <p className="text-text-secondary">
                Mitra vendor telah aktif dan siap dipilih saat penerimaan bahan baku (Inbound) maupun Surat Perintah Kerja (SPK).
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
                  kodeSupplier: "",
                  namaSupplier: "",
                  kontakSupplier: "",
                  pic: "",
                  jenisBarangSupplier: "Kain Cordura, Ripstop & Canvas",
                  kota: "Bandung, Jawa Barat",
                  alamat: "",
                  telepon: "",
                  email: "",
                  leadTime: "3-5 Hari",
                  termOfPayment: "Net 30 Hari",
                  status: "Aktif",
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
            Template Cepat Profil Rekanan:
          </span>
          <span className="text-[11px] text-text-muted">Klik untuk mengisi profil contoh</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_SUPPLIERS.map((p) => (
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
                {p.jenis} &bull; {p.kota}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Profil Perusahaan (2 Span) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Profil Perusahaan / Badan Usaha Vendor</CardTitle>
                <CardDescription>
                  Nama resmi vendor, jenis komoditas yang dipasok, dan identitas kontak representatif.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Row 1: Kode Supplier & Nama */}
              {/* Row 1: Kode Supplier & Nama */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black-primary">
                      Kode Supplier
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
                    value={formData.kodeSupplier}
                    onChange={(e) => handleChange("kodeSupplier", e.target.value.toUpperCase())}
                    placeholder="SUP-..."
                    className={cn(
                      "font-mono font-bold uppercase",
                      isDuplicateCode && "border-accent-red text-accent-red"
                    )}
                  />
                  {isDuplicateCode && (
                    <span className="text-[10px] text-accent-red font-medium">Sudah terdaftar!</span>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">
                    Nama Badan Usaha / PT / CV <span className="text-accent-red">*</span>
                  </label>
                  <Input
                    value={formData.namaSupplier}
                    onChange={(e) => handleChange("namaSupplier", e.target.value)}
                    placeholder="cth: PT Sinar Tekstil Mandiri"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Spesialisasi Komoditas (Pilih Kategori Grid) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Spesialisasi Pasokan Material <span className="text-accent-red">*</span>
                  </label>
                  <span className="text-[11px] text-text-muted">Pilih kategori utama pasokan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {KATEGORI_SUPPLIER_OPTIONS.map((opt) => {
                    const isSelected = formData.jenisBarangSupplier === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChange("jenisBarangSupplier", opt)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-left text-xs transition-all flex items-start justify-between gap-2",
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

              {/* Row 3: PIC, Telepon, & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Narahubung (PIC)</label>
                  <Input
                    value={formData.pic}
                    onChange={(e) => handleChange("pic", e.target.value)}
                    placeholder="cth: Bpk. Sinaga"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">No. WhatsApp / Telepon</label>
                  <Input
                    value={formData.telepon}
                    onChange={(e) => handleChange("telepon", e.target.value)}
                    placeholder="cth: 0812-4567-8901"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Alamat Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="sales@perusahaan.com"
                  />
                </div>
              </div>

              {/* Row 4: Kota & Alamat Pabrik / Gudang */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Kota / Daerah</label>
                  <Input
                    value={formData.kota}
                    onChange={(e) => handleChange("kota", e.target.value)}
                    placeholder="cth: Bandung, Jawa Barat"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Alamat Kantor / Pabrik</label>
                  <Input
                    value={formData.alamat}
                    onChange={(e) => handleChange("alamat", e.target.value)}
                    placeholder="cth: Kawasan Industri Batununggal No. 45"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: SLA Pengiriman & Pembayaran (1 Span) */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>SLA &amp; Ketentuan Bisnis</CardTitle>
                <CardDescription>
                  Target waktu pengiriman bahan dan kesepakatan termin pembayaran.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Lead Time Pengiriman */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Estimasi Lead Time Pengiriman
                  </label>
                  <span className="text-[10px] text-text-muted">Target SLA</span>
                </div>
                <Input
                  value={formData.leadTime}
                  onChange={(e) => handleChange("leadTime", e.target.value)}
                  placeholder="cth: 3-5 Hari Kerja"
                  className="font-medium"
                />
              </div>

              {/* Term of Payment: Button Row Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Term of Payment (TOP)
                  </label>
                  <span className="text-[10px] text-text-muted">Pilih skema bayar</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {TOP_OPTIONS.map((top) => {
                    const isSelected = formData.termOfPayment === top;
                    return (
                      <button
                        key={top}
                        type="button"
                        onClick={() => handleChange("termOfPayment", top)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between",
                          isSelected
                            ? "bg-accent-yellow/15 border-accent-yellow text-black-primary font-bold shadow-sm"
                            : "bg-surface-muted/40 border-border-default text-text-secondary hover:bg-surface-muted hover:border-border-hover"
                        )}
                      >
                        <span>{top}</span>
                        {isSelected && (
                          <span className="size-1.5 rounded-full bg-accent-yellow shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Supplier: Segmented Buttons */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-black-primary">Status Rekanan</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: "Aktif", label: "Aktif", sub: "Verified", dot: "bg-emerald-500" },
                    { value: "Dalam Evaluasi", label: "Evaluasi", sub: "Trial", dot: "bg-accent-yellow" },
                    { value: "Non-Aktif", label: "Non-Aktif", sub: "Hold", dot: "bg-text-muted" },
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
                {loading ? "Menyimpan..." : "Daftarkan Vendor"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}

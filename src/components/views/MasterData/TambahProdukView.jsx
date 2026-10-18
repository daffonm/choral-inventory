"use client";

import React, { useState, useRef } from "react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Input, Icons } from "@/components/ui";
import { useAppConfig } from "@/providers/AppProvider";
import { createMasterProduct } from "@/lib/services/inventory-service";
import { cn, formatNumber } from "@/lib/utils/utils";

// Sample preset images for fast demo / testing
const PRESET_IMAGES = [
  {
    name: "Tactical Sling Bag",
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Tactical Backpack 25L",
    url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Military Waistbag",
    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "EDC Modular Pouch",
    url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
  },
];

const KATEGORI_OPTIONS = [
  "Sling Bag",
  "Backpack",
  "Waistbag",
  "Tactical Pouch",
  "Tote Bag",
  "Aksesoris & Patch",
];

const WARNA_OPTIONS = [
  { label: "Matte Black", value: "Matte Black", hex: "#121212" },
  { label: "Olive Drab Green", value: "Olive Drab Green", hex: "#4B5320" },
  { label: "Coyote Tan", value: "Coyote Tan", hex: "#81613C" },
  { label: "Wolf Grey", value: "Wolf Grey", hex: "#6B7280" },
  { label: "Multicam Camo", value: "Multicam Camo", hex: "#3F3B2E" },
];

export default function TambahProdukView({ onBack, onSuccess, lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sku: "",
    namaProduk: "",
    kategori: "Sling Bag",
    variant: "Standard Tactical",
    size: "M (6L)",
    color: "Matte Black",
    barcode: "",
    satuan: "Pcs",
    jenisBarang: "Produk Jadi",
    price: "",
    hpp: "",
    currentStock: "100",
    minStock: "20",
    lokasiGudang: "Gudang Utama (Rack A1)",
    deskripsi: "",
    fotoUrl: "",
    status: "Aktif",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
  };

  // Helper untuk auto-generate SKU
  const handleAutoGenerateSku = () => {
    const prefix = "CHR";
    const catCode = formData.kategori.slice(0, 3).toUpperCase().replace(/\s/g, "");
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const colorCode = formData.color.slice(0, 3).toUpperCase().replace(/\s/g, "");
    const newSku = `${prefix}-${catCode}-${randomHex}-${colorCode}`;
    const newBarcode = `899${Date.now().toString().slice(-10)}`;

    setFormData((prev) => ({
      ...prev,
      sku: newSku,
      barcode: prev.barcode || newBarcode,
    }));
  };

  // File Upload Handlers (Read as Data URL)
  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("File yang diunggah harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }
    // Limit max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      handleChange("fotoUrl", e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Kalkulasi Margin Finansial Realtime
  const hargaJual = parseInt(formData.price || 0, 10);
  const hppModal = parseInt(formData.hpp || 0, 10);
  const profitMargin = hargaJual > 0 && hppModal > 0 ? hargaJual - hppModal : 0;
  const marginPercentage = hargaJual > 0 && profitMargin > 0 ? ((profitMargin / hargaJual) * 100).toFixed(1) : 0;

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.sku.trim()) {
      setErrorMessage("Kode SKU wajib diisi atau klik tombol 'Auto SKU'.");
      return;
    }
    if (!formData.namaProduk.trim()) {
      setErrorMessage("Nama produk tidak boleh kosong.");
      return;
    }
    if (!formData.price || parseInt(formData.price, 10) <= 0) {
      setErrorMessage("Harga jual produk wajib diisi dengan nilai yang valid.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const result = await createMasterProduct(formData);

      if (result.success) {
        setSuccessSaved(true);
        if (onSuccess) onSuccess(result.sku);
      } else {
        setErrorMessage(result.error || "Gagal menyimpan produk ke Firestore.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Terjadi kesalahan internal saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      sku: "",
      namaProduk: "",
      kategori: "Sling Bag",
      variant: "Standard Tactical",
      size: "M (6L)",
      color: "Matte Black",
      barcode: "",
      satuan: "Pcs",
      jenisBarang: "Produk Jadi",
      price: "",
      hpp: "",
      currentStock: "100",
      minStock: "20",
      lokasiGudang: "Gudang Utama (Rack A1)",
      deskripsi: "",
      fotoUrl: "",
      status: "Aktif",
    });
    setSuccessSaved(false);
    setErrorMessage("");
  };

  return (
    <div
      data-slot="tambah-produk-view"
      className="animate-view-slide-in-right flex flex-col gap-6 w-full pb-16"
    >
      {/* 1. TOP HEADER & BREADCRUMB NAVIGATION */}
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
                {lang === "id" ? "Tambah Master Produk Baru" : "Add New Master Product"}
              </h2>
              <Badge variant="yellow" size="sm">
                Master Catalog
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Daftarkan SKU produk baru ke katalog master dan sinkronkan stok awal ke inventaris secara realtime."
                : "Register a new product SKU into the master catalog and sync initial inventory levels."}
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={loading}>
            {lang === "id" ? "Batal" : "Cancel"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={loading ? Icons.Loader : Icons.Check}
            onClick={handleSubmit}
            disabled={loading || successSaved}
            className={cn("min-w-[130px]", loading && "animate-pulse")}
          >
            {loading
              ? lang === "id"
                ? "Menyimpan..."
                : "Saving..."
              : lang === "id"
              ? "Simpan Produk"
              : "Save Product"}
          </Button>
        </div>
      </div>

      {/* 2. SUCCESS FEEDBACK BANNER */}
      {successSaved && (
        <div
          data-slot="success-banner"
          className="p-4 rounded-xl bg-accent-yellow-surface border border-accent-yellow-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-view-slide-in-right"
        >
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-punch-black text-accent-yellow flex items-center justify-center shrink-0">
              <Icons.Check className="size-4 font-bold" />
            </div>
            <div>
              <div className="text-xs font-bold text-black-primary">
                {lang === "id"
                  ? `Produk SKU ${formData.sku} Berhasil Disimpan!`
                  : `Product SKU ${formData.sku} Successfully Saved!`}
              </div>
              <div className="text-[11px] text-text-secondary">
                {lang === "id"
                  ? "Data telah disinkronkan ke master_products dan live inventory Firestore."
                  : "Data has been synced to master_products and live inventory Firestore."}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={handleResetForm}>
              {lang === "id" ? "Tambah Produk Lain" : "Add Another"}
            </Button>
            <Button variant="dark" size="sm" onClick={onBack}>
              {lang === "id" ? "Lihat di Katalog →" : "View in Catalog →"}
            </Button>
          </div>
        </div>
      )}

      {/* 3. ERROR ALERT */}
      {errorMessage && (
        <div
          data-slot="error-banner"
          className="p-3.5 rounded-lg bg-accent-red-surface border border-accent-red-border text-accent-red text-xs font-medium flex items-center gap-2.5"
        >
          <span className="size-2 rounded-full bg-accent-red shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4. MAIN FORM GRID */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PRIMARY ATTRIBUTES (~7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* CARD 1: INFORMASI IDENTITAS PRODUK */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div>
                <CardTitle>{lang === "id" ? "Identitas & Informasi Dasar" : "Identity & Basic Information"}</CardTitle>
                <CardDescription>
                  {lang === "id" ? "Kode unik SKU, nama resmi produk, dan klasifikasi kategori" : "Unique SKU, official product title, and category classification"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              {/* SKU & Auto Generator */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    SKU / Kode Produk <span className="text-accent-red">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSku}
                    className="text-[11px] font-semibold text-text-secondary hover:text-black-primary flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Icons.Sparkles className="size-3 text-accent-yellow-hover" />
                    Auto Generate SKU
                  </button>
                </div>
                <Input
                  placeholder="Contoh: CHR-SLG-ALPHA-BLK"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value.toUpperCase())}
                  icon={Icons.Barcode}
                  className="font-mono uppercase font-bold"
                />
                <span className="text-[10px] text-text-muted">
                  Gunakan format singkatan standar (Brand-Kategori-Model-Warna).
                </span>
              </div>

              {/* Nama Produk */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Nama Resmi Produk <span className="text-accent-red">*</span>
                </label>
                <Input
                  placeholder="Contoh: Choral Tactical Sling Bag Alpha V2"
                  value={formData.namaProduk}
                  onChange={(e) => handleChange("namaProduk", e.target.value)}
                  icon={Icons.ProductBag}
                />
              </div>

              {/* Barcode & Kategori Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Kategori Produk</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => handleChange("kategori", e.target.value)}
                    className="h-10 px-3 text-xs font-medium text-black-primary bg-surface-muted border border-border-default rounded-[10px] focus:outline-none focus:border-accent-yellow/70 transition-colors"
                  >
                    {KATEGORI_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Barcode / EAN-13</label>
                  <Input
                    placeholder="899..."
                    value={formData.barcode}
                    onChange={(e) => handleChange("barcode", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Jenis Barang & Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Jenis Barang</label>
                  <select
                    value={formData.jenisBarang}
                    onChange={(e) => handleChange("jenisBarang", e.target.value)}
                    className="h-10 px-3 text-xs font-medium text-black-primary bg-surface-muted border border-border-default rounded-[10px] focus:outline-none focus:border-accent-yellow/70 transition-colors"
                  >
                    <option value="Produk Jadi">Produk Jadi (Finished Good)</option>
                    <option value="Semi-Finished">Semi-Finished (Half-Goods)</option>
                    <option value="Merchandise">Merchandise & Promo</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Satuan Unit</label>
                  <select
                    value={formData.satuan}
                    onChange={(e) => handleChange("satuan", e.target.value)}
                    className="h-10 px-3 text-xs font-medium text-black-primary bg-surface-muted border border-border-default rounded-[10px] focus:outline-none focus:border-accent-yellow/70 transition-colors"
                  >
                    <option value="Pcs">Pcs (Satuan)</option>
                    <option value="Set">Set / Bundle</option>
                    <option value="Lusin">Lusin (12 Pcs)</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Deskripsi & Spesifikasi Produk
                </label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => handleChange("deskripsi", e.target.value)}
                  placeholder="Catatan material (misal Cordura 1000D), fitur waterproof, kompartemen laptop..."
                  className="w-full p-3 text-xs font-medium text-black-primary bg-surface-muted border border-border-default rounded-[10px] placeholder:text-text-muted focus:outline-none focus:border-accent-yellow/70 transition-colors resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: VARIAN, UKURAN & WARNA */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div>
                <CardTitle>{lang === "id" ? "Varian & Spesifikasi Fisik" : "Variant & Physical Specs"}</CardTitle>
                <CardDescription>
                  {lang === "id" ? "Atribut varian model, dimensi ukuran, dan palet warna" : "Variant model, dimension sizes, and color palettes"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Nama Varian</label>
                  <Input
                    placeholder="Contoh: Tactical Heavy Duty"
                    value={formData.variant}
                    onChange={(e) => handleChange("variant", e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Ukuran / Kapasitas Size</label>
                  <Input
                    placeholder="Contoh: M (6L) atau 25L"
                    value={formData.size}
                    onChange={(e) => handleChange("size", e.target.value)}
                  />
                </div>
              </div>

              {/* Pilihan Warna Cepat */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-black-primary">Warna Produk</label>
                <div className="flex flex-wrap gap-2">
                  {WARNA_OPTIONS.map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => handleChange("color", w.value)}
                      className={cn(
                        "h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer",
                        formData.color === w.value
                          ? "border-black-primary bg-punch-black text-white shadow-xs"
                          : "border-border-default bg-surface-card hover:bg-surface-muted text-text-secondary"
                      )}
                    >
                      <span
                        className="size-3 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: w.hex }}
                      />
                      <span>{w.label}</span>
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Atau ketik warna kustom..."
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  size="sm"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: HARGA & PENETAPAN MARGIN */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div>
                <CardTitle>{lang === "id" ? "Penetapan Harga & Margin Finansial" : "Pricing & Margin Architecture"}</CardTitle>
                <CardDescription>
                  {lang === "id" ? "Harga jual eceran, modal HPP produksi, dan margin kotor otomatis" : "Retail selling price, COGS manufacturing cost, and margin projection"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">
                    Harga Jual Retail (IDR) <span className="text-accent-red">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="249000"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="font-mono font-bold"
                  />
                  <span className="text-[10px] text-text-muted">
                    {hargaJual > 0 ? `Rp ${formatNumber(hargaJual)}` : "Rp 0"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">
                    Harga Pokok Produksi (HPP / Modal)
                  </label>
                  <Input
                    type="number"
                    placeholder="125000"
                    value={formData.hpp}
                    onChange={(e) => handleChange("hpp", e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-[10px] text-text-muted">
                    {hppModal > 0 ? `Rp ${formatNumber(hppModal)}` : "Rp 0"}
                  </span>
                </div>
              </div>

              {/* Live Margin Calculation Card */}
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border-subtle flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-text-secondary font-medium">Estimasi Gross Profit / Unit:</div>
                  <div className="text-sm font-bold font-mono text-black-primary">
                    Rp {formatNumber(profitMargin)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-text-secondary font-medium">Margin Ratio:</div>
                  <Badge variant={marginPercentage >= 40 ? "yellow" : "neutral"} size="sm">
                    {marginPercentage}% Gross Margin
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: FOTO PRODUK & LOGISTIK GUDANG (~5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* CARD 4: FOTO & VISUAL PRODUK */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>{lang === "id" ? "Foto Produk" : "Product Media"}</CardTitle>
                  <CardDescription>
                    {lang === "id" ? "Format JPG, PNG, atau WebP (Maks 5MB)" : "Upload high-res product photo"}
                  </CardDescription>
                </div>
                {formData.fotoUrl && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleChange("fotoUrl", "")}
                    className="text-accent-red hover:text-accent-red-hover gap-1"
                  >
                    <Icons.Trash className="size-3" />
                    Hapus
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              {/* Image Preview / Dropzone */}
              {formData.fotoUrl ? (
                <div className="relative group w-full aspect-4/3 rounded-xl overflow-hidden border border-border-default bg-surface-muted shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.fotoUrl}
                    alt={formData.namaProduk || "Product Preview"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Ganti Foto
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleChange("fotoUrl", "")}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full aspect-4/3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200",
                    dragOver
                      ? "border-accent-yellow bg-accent-yellow-surface/50 scale-[0.99]"
                      : "border-border-default hover:border-accent-yellow/60 bg-surface-muted/60 hover:bg-surface-muted"
                  )}
                >
                  <div className="size-12 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-center text-text-muted mb-3 shadow-2xs group-hover:scale-110 transition-transform">
                    <Icons.UploadCloud className="size-6 text-text-secondary" />
                  </div>
                  <div className="text-xs font-bold text-black-primary">
                    Tarik & Lepas Foto di Sini
                  </div>
                  <div className="text-[11px] text-text-muted mt-1 max-w-[200px]">
                    atau klik untuk browse dari komputer lokal Anda
                  </div>
                </div>
              )}

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {/* Quick Image URL Input */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-[11px] font-semibold text-text-secondary">
                  Atau masukkan URL gambar langsung:
                </label>
                <Input
                  placeholder="https://..."
                  value={formData.fotoUrl}
                  onChange={(e) => handleChange("fotoUrl", e.target.value)}
                  size="sm"
                  icon={Icons.Image}
                />
              </div>

              {/* Preset Sample Images for Demo Testing */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Preset Contoh Foto Produk CHORAL:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => handleChange("fotoUrl", img.url)}
                      className={cn(
                        "p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer hover:border-accent-yellow/60",
                        formData.fotoUrl === img.url
                          ? "border-accent-yellow bg-accent-yellow-surface/40 font-bold"
                          : "border-border-default bg-surface-card text-text-secondary text-xs"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="size-8 rounded object-cover shrink-0"
                      />
                      <span className="text-[11px] truncate leading-tight">{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 5: PENGATURAN INVENTARIS AWAL & RAK GUDANG */}
          <Card>
            <CardHeader className="pb-3 border-b border-border-subtle">
              <div>
                <CardTitle>{lang === "id" ? "Stok & Logistik Gudang" : "Stock & Warehouse Logistics"}</CardTitle>
                <CardDescription>
                  {lang === "id" ? "Stok awal, ambang batas minimum buffer, dan lokasi rak" : "Initial inventory levels, safety buffer, and shelf locations"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Stok Awal (Pcs)</label>
                  <Input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => handleChange("currentStock", e.target.value)}
                    className="font-mono font-bold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">Batas Stok Minimum</label>
                  <Input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => handleChange("minStock", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Lokasi Rak Gudang */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">Lokasi Rak Gudang</label>
                <select
                  value={formData.lokasiGudang}
                  onChange={(e) => handleChange("lokasiGudang", e.target.value)}
                  className="h-10 px-3 text-xs font-medium text-black-primary bg-surface-muted border border-border-default rounded-[10px] focus:outline-none focus:border-accent-yellow/70 transition-colors"
                >
                  <option value="Gudang Utama (Rack A1)">Gudang Utama (Rack A1 - Tactical Bags)</option>
                  <option value="Gudang Utama (Rack B2)">Gudang Utama (Rack B2 - Backpacks)</option>
                  <option value="Gudang Utama (Rack C1)">Gudang Utama (Rack C1 - Pouches & Wallets)</option>
                  <option value="Gudang Transit Produksi">Gudang Transit Produksi (Floor 2)</option>
                  <option value="Warehouse Cabang Jakarta">Warehouse Cabang Jakarta (Hub 1)</option>
                </select>
              </div>

              {/* Status Publikasi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">Status Publikasi</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-black-primary">
                    <input
                      type="radio"
                      name="status"
                      value="Aktif"
                      checked={formData.status === "Aktif"}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="accent-black-primary size-4"
                    />
                    Aktif (Ready for Sale)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-black-primary">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formData.status === "Draft"}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="accent-black-primary size-4"
                    />
                    Draft / Belum Rilis
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={handleResetForm} disabled={loading}>
                Reset Isian
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={loading ? Icons.Loader : Icons.Check}
                onClick={handleSubmit}
                disabled={loading || successSaved}
              >
                {loading ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}

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
import { createMasterChannel } from "@/lib/services/inventory-service";
import { cn } from "@/lib/utils/utils";

const TIPE_CHANNEL_OPTIONS = [
  {
    value: "Marketplace Online (E-Commerce)",
    label: "Marketplace Online",
    sub: "Shopee, Tokopedia, TikTok Shop, Lazada",
    badge: "API Sync",
  },
  {
    value: "Social Commerce (Live Stream / Affiliate)",
    label: "Social Commerce & Live",
    sub: "TikTok Live, Instagram Live, Affiliate Creator",
    badge: "Live Ops",
  },
  {
    value: "B2B Corporate Direct Order",
    label: "B2B Corporate Direct",
    sub: "Instansi, custom batch, SPK komunitas",
    badge: "Invoicing",
  },
  {
    value: "Offline Store / Flagship Store",
    label: "Offline Flagship Store",
    sub: "Store fisik, display showroom, walk-in buyer",
    badge: "POS Retail",
  },
  {
    value: "Bazaar & Pop-up Event",
    label: "Bazaar & Pop-up Event",
    sub: "JakCloth, Wall Off, pameran temporary",
    badge: "Event Cash",
  },
  {
    value: "Konsinyasi Mitra Distro",
    label: "Konsinyasi Mitra Distro",
    sub: "Titip jual outlet partner, bagi hasil bulanan",
    badge: "Consign",
  },
  {
    value: "Internal Usage & Endorsement",
    label: "Internal & Endorsement",
    sub: "Reviewer, influencer seeding, sampel katalog",
    badge: "Non-Revenue",
  },
];

const KOMISI_PRESETS = ["0%", "2.5%", "5.0%", "6.5%", "7.5%", "8.0%", "10.0%"];

const SETTLEMENT_OPTIONS = [
  "H+1 Otomatis",
  "H+3 Pesanan Selesai",
  "Mingguan (Setiap Senin)",
  "Bulanan (Net 30)",
  "Tunai / Settlement Langsung",
];

const PRESET_CHANNELS = [
  {
    nama: "Shopee Official Mall CHORAL",
    id: "CHN-SHP",
    tipe: "Marketplace Online (E-Commerce)",
    komisi: "7.5%",
    pic: "E-Commerce Ops Team",
    url: "https://shopee.co.id/choral.official",
    settlement: "H+1 Otomatis",
  },
  {
    nama: "TikTok Shop Live Official",
    id: "CHN-TTS",
    tipe: "Social Commerce (Live Stream / Affiliate)",
    komisi: "8.0%",
    pic: "Live Host & Creator Lead",
    url: "https://tiktok.com/@choral.id",
    settlement: "Mingguan (Setiap Senin)",
  },
  {
    nama: "Tokopedia Official Store",
    id: "CHN-TKP",
    tipe: "Marketplace Online (E-Commerce)",
    komisi: "6.5%",
    pic: "Tokopedia Account Executive",
    url: "https://tokopedia.com/choral-official",
    settlement: "H+1 Otomatis",
  },
  {
    nama: "Bazaar & Pop-up JakCloth / Wall Off",
    id: "CHN-BZR",
    tipe: "Bazaar & Pop-up Event",
    komisi: "0%",
    pic: "Andi Wijaya (Event Lead)",
    url: "Offline Booth Event",
    settlement: "Tunai / Settlement Langsung",
  },
];

export default function TambahChannelView({
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
    channelId: "",
    namaChannel: "",
    tipe: "Marketplace Online (E-Commerce)",
    komisi: "7.5%",
    urlToko: "",
    settlement: "H+1 Otomatis",
    pic: "",
    status: "Aktif",
    keterangan: "",
  });

  const cleanCode = String(formData.channelId || "").trim().toUpperCase();
  const isDuplicateCode = Boolean(cleanCode && existingCodes.has(cleanCode));
  const isCodeValid = Boolean(cleanCode && !isDuplicateCode && cleanCode.length >= 3);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      channelId: preset.id,
      namaChannel: preset.nama,
      tipe: preset.tipe,
      komisi: preset.komisi,
      urlToko: preset.url || "",
      settlement: preset.settlement || "H+1 Otomatis",
      pic: preset.pic,
      status: "Aktif",
      keterangan: `Channel penjualan terintegrasi: ${preset.nama}`,
    });
    setErrorMessage("");
  };

  const handleAutoGenerateCode = () => {
    const prefix = "CHN";
    const randomHex = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${randomHex}`;
    handleChange("channelId", newCode);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.namaChannel.trim()) {
      setErrorMessage("Nama channel distribusi wajib diisi.");
      return;
    }
    if (isDuplicateCode) {
      setErrorMessage(`ID Channel ${cleanCode} sudah terdaftar. Gunakan ID unik lain.`);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await createMasterChannel({
        ...formData,
        kodeChannel: formData.channelId,
      });

      if (res.success) {
        setSuccessSaved(true);
        if (onSuccess) onSuccess(res.channelId);
      } else {
        setErrorMessage(res.error || "Gagal menyimpan channel ke Firestore.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan internal saat mendaftarkan channel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-slot="tambah-channel-view"
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
                {lang === "id" ? "Tambah Channel Distribusi Penjualan" : "Register Sales Channel"}
              </h2>
              <Badge variant="yellow" size="sm">
                Master Channels
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Konfigurasikan kanal e-commerce, media sosial, toko offline, konsinyasi, dan biaya komisi platform."
                : "Configure e-commerce channels, social stores, offline outlets, and platform commission rates."}
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
              ? "Simpan Channel"
              : "Save Channel"}
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
                Channel {formData.namaChannel} Berhasil Didaftarkan!
              </p>
              <p className="text-text-secondary">
                Kanal penjualan telah aktif dan siap digunakan untuk integrasi order serta transaksi penjualan.
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
                  channelId: "",
                  namaChannel: "",
                  tipe: "Marketplace Online (E-Commerce)",
                  komisi: "7.5%",
                  urlToko: "",
                  settlement: "H+1 Otomatis",
                  pic: "",
                  status: "Aktif",
                  keterangan: "",
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
            Preset Channel Penjualan CHORAL:
          </span>
          <span className="text-[11px] text-text-muted">Klik untuk mengisi konfigurasi otomatis</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_CHANNELS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 rounded-xl border border-border-subtle bg-surface-muted/40 hover:bg-surface-muted/80 hover:border-accent-yellow/40 transition-all text-left flex flex-col gap-1"
            >
              <span className="text-[10px] font-mono font-bold text-accent-yellow-hover">
                {p.id}
              </span>
              <span className="text-xs font-bold text-black-primary truncate">
                {p.nama}
              </span>
              <span className="text-[10px] text-text-muted">
                Komisi: {p.komisi} &bull; {p.tipe.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Detail Channel (2 Span) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Identitas &amp; Jenis Saluran Penjualan</CardTitle>
                <CardDescription>
                  Kode channel unik, nama toko resmi, klasifikasi saluran pemasaran, dan tautan toko.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Row 1: ID & Nama Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black-primary">
                      ID Channel
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
                    value={formData.channelId}
                    onChange={(e) => handleChange("channelId", e.target.value.toUpperCase())}
                    placeholder="CHN-..."
                    className={cn(
                      "font-mono font-bold uppercase",
                      isDuplicateCode && "border-accent-red text-accent-red"
                    )}
                  />
                  {isDuplicateCode && (
                    <span className="text-[10px] text-accent-red font-medium">ID sudah digunakan!</span>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">
                    Nama Toko / Saluran Penjualan <span className="text-accent-red">*</span>
                  </label>
                  <Input
                    value={formData.namaChannel}
                    onChange={(e) => handleChange("namaChannel", e.target.value)}
                    placeholder="cth: Shopee Official Mall CHORAL"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Tipe Saluran Penjualan Tile Grid */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Tipe &amp; Kategori Saluran <span className="text-accent-red">*</span>
                  </label>
                  <span className="text-[11px] text-text-muted">Pilih jenis kanal distribusi</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIPE_CHANNEL_OPTIONS.map((opt) => {
                    const isSelected = formData.tipe === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange("tipe", opt.value)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2",
                          isSelected
                            ? "bg-accent-yellow/15 border-accent-yellow text-black-primary font-bold shadow-sm ring-1 ring-accent-yellow/30"
                            : "bg-surface-muted/40 border-border-default text-text-secondary hover:bg-surface-muted hover:border-border-hover"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{opt.label}</span>
                            <Badge variant="neutral" size="xs">
                              {opt.badge}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-text-muted leading-tight">{opt.sub}</span>
                        </div>
                        {isSelected && (
                          <span className="size-2 rounded-full bg-accent-yellow shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Biaya / Komisi Platform (Preset Buttons + Input) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Biaya / Komisi Platform
                  </label>
                  <span className="text-[10px] text-text-muted">Potongan marketplace per pesanan</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {KOMISI_PRESETS.map((p) => {
                    const isSelected = formData.komisi === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleChange("komisi", p)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all",
                          isSelected
                            ? "bg-accent-yellow border-accent-yellow text-black-primary shadow-sm"
                            : "bg-surface-muted/40 border-border-default text-text-secondary hover:bg-surface-muted"
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <div className="flex-1 min-w-[120px]">
                    <Input
                      value={formData.komisi}
                      onChange={(e) => handleChange("komisi", e.target.value)}
                      placeholder="Custom % / fee"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: URL Toko & Penanggung Jawab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">
                    Tautan / URL Toko Online
                  </label>
                  <Input
                    value={formData.urlToko}
                    onChange={(e) => handleChange("urlToko", e.target.value)}
                    placeholder="https://shopee.co.id/choral..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-black-primary">
                    Penanggung Jawab (PIC / Tim)
                  </label>
                  <Input
                    value={formData.pic}
                    onChange={(e) => handleChange("pic", e.target.value)}
                    placeholder="cth: E-Commerce Operations Lead"
                  />
                </div>
              </div>

              {/* Row 5: Catatan / Ketentuan Khusus */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-black-primary">
                  Catatan Ketentuan Channel &amp; SLA
                </label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => handleChange("keterangan", e.target.value)}
                  rows={2}
                  placeholder="cth: Akun resmi Shopee Mall dengan fasilitas gratis ongkir XTRA, batas pickup kurir pukul 16:00 WIB."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow resize-none leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Status & Kebijakan Pencairan (1 Span) */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Status &amp; Operasional</CardTitle>
                <CardDescription>
                  Status aktifitas saluran penjualan dan siklus pencairan saldo dana.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Status Channel: Segmented Buttons */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-black-primary">
                  Status Channel
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: "Aktif", label: "Aktif", sub: "Live", dot: "bg-emerald-500" },
                    { value: "Paused", label: "Paused", sub: "Libur", dot: "bg-accent-yellow" },
                    { value: "Testing", label: "Testing", sub: "Sandbox", dot: "bg-text-muted" },
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

              {/* Periode Settlement / Pencairan Dana */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black-primary">
                    Siklus Settlement Dana
                  </label>
                  <span className="text-[10px] text-text-muted">Jadwal transfer</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {SETTLEMENT_OPTIONS.map((st) => {
                    const isSelected = formData.settlement === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleChange("settlement", st)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-xs text-left transition-all flex items-center justify-between",
                          isSelected
                            ? "bg-accent-yellow/15 border-accent-yellow text-black-primary font-bold shadow-sm"
                            : "bg-surface-muted/40 border-border-default text-text-secondary hover:bg-surface-muted hover:border-border-hover"
                        )}
                      >
                        <span>{st}</span>
                        {isSelected && (
                          <span className="size-1.5 rounded-full bg-accent-yellow shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ringkasan Finansial */}
              <div className="p-3 rounded-xl bg-surface-muted/60 border border-border-subtle flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Tipe Integrasi:</span>
                  <Badge variant="neutral" size="xs">REST API &amp; Webhook</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Sync Stok:</span>
                  <span className="font-mono text-accent-yellow-hover font-bold">Managed Separately</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                  <span className="text-text-secondary">Komisi Efektif:</span>
                  <span className="font-mono font-bold text-black-primary">{formData.komisi || "0%"}</span>
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
                {loading ? "Menyimpan..." : "Simpan Channel"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}

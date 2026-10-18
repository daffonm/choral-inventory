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
  SegmentedControl,
  CopyInput,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Icons,
} from "@/components/ui";
import { useAppConfig } from "@/providers/AppProvider";
import { seedInventoryFromDummy } from "@/lib/services/inventory-service";

export default function SettingsView({
  lang: propLang,
  setLang: propSetLang,
  themeMode: propThemeMode,
  setThemeMode: propSetThemeMode,
}) {
  const appConfig = useAppConfig();
  const lang = propLang || appConfig.lang || "id";
  const setLang = propSetLang || appConfig.setLang;
  const theme = propThemeMode || appConfig.theme || "dark";
  const setTheme = propSetThemeMode || appConfig.setTheme;

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedInventoryFromDummy();
      if (res.success) {
        setSeedResult({
          success: true,
          message: `Berhasil menginisialisasi ${res.count} item persediaan ke Firestore dengan barcode!`,
        });
      } else {
        setSeedResult({
          success: false,
          message: res.error || "Gagal mengimpor data ke Firestore.",
        });
      }
    } catch (err) {
      setSeedResult({
        success: false,
        message: err.message || "Terjadi kesalahan saat inisialisasi data.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const t = {
    id: {
      settingsTitle: "Pengaturan Sistem",
      settingsSubtitle: "Kelola konfigurasi antarmuka, preferensi bahasa, dan kredensial API inventaris.",
      themeCardTitle: "Tema & Tampilan",
      themeCardDesc: "Pilih skema warna antarmuka: Terang (Light) atau Gelap (Dark).",
      themeLight: "Terang",
      themeDark: "Gelap",
      langCardTitle: "Setelan Bahasa",
      langCardDesc: "Pilih bahasa tampilan sistem inventaris dan laporan operasional gudang CHORAL.",
      langLabel: "Bahasa Antarmuka",
      langDesc: "Bahasa yang digunakan pada seluruh menu navigasi, notifikasi, dan data stok.",
      langActivePill: "Aktif",
      langActiveDesc: "Perubahan bahasa langsung berlaku pada sesi aktif Anda tanpa memuat ulang halaman.",
      apiCardTitle: "Endpoint URL Inventaris",
      apiCardDesc: "RESTful endpoint untuk query data stok gudang dan sinkronisasi multi-channel marketplace.",
      apiKeysTitle: "Kunci Akses API (API Keys)",
      apiKeysDesc: "Akses API diamankan di belakang gateway multi-channel (Shopee, TikTok Shop, Tokopedia).",
      clientDocsBtn: "Dokumentasi Klien",
      publicKeyLabel: "Public Key (Anon)",
      publicKeyDesc: "Kunci ini aman digunakan di aplikasi klien browser atau webstore publik.",
      secretKeyLabel: "Secret Key (Service Role)",
      secretKeyDesc: "Memiliki otorisasi bypass penuh ke database stok. Jangan pernah dibagikan ke publik!",
      upcomingChange: "Perubahan Mendatang",
      upcomingDesc: "Kunci API versi legacy akan dialihkan ke autentikasi HMAC terenkripsi bulan depan.",
      readAnnouncement: "Baca Pengumuman",
      copied: "Tersalin!",
      copy: "Salin",
      showKey: "Tampilkan",
      hideKey: "Sembunyikan",
      dataApiTitle: "Pengaturan Data API",
      dataApiDesc: "Ketika diaktifkan, semua mutasi stok gudang otomatis memicu webhook event ke marketplace.",
      saveChanges: "Simpan Preferensi",
    },
    en: {
      settingsTitle: "System Settings",
      settingsSubtitle: "Manage interface configurations, language preferences, and inventory API credentials.",
      themeCardTitle: "Appearance & Theme",
      themeCardDesc: "Select interface color scheme: Light mode or Dark mode.",
      themeLight: "Light",
      themeDark: "Dark",
      langCardTitle: "Language Settings",
      langCardDesc: "Choose display language for inventory navigation and warehouse operational reports.",
      langLabel: "Display Language",
      langDesc: "Language applied across all navigation menus, alerts, and stock data views.",
      langActivePill: "Active",
      langActiveDesc: "Language changes are applied immediately across your session without page reload.",
      apiCardTitle: "Inventory Endpoint URL",
      apiCardDesc: "RESTful endpoint for querying warehouse stock and multi-channel marketplace sync.",
      apiKeysTitle: "Project API Keys",
      apiKeysDesc: "Your API access is secured behind a multi-channel API gateway (Shopee, TikTok, Tokopedia).",
      clientDocsBtn: "Client Docs",
      publicKeyLabel: "Public Key (Anon)",
      publicKeyDesc: "This key is safe to use in a browser client or public webstore storefront.",
      secretKeyLabel: "Secret Key (Service Role)",
      secretKeyDesc: "Has master bypass permissions to the inventory database. Never share publicly!",
      upcomingChange: "Upcoming Change",
      upcomingDesc: "Legacy API keys will transition to encrypted HMAC authentication credentials next month.",
      readAnnouncement: "Read Announcement",
      copied: "Copied!",
      copy: "Copy",
      showKey: "Show",
      hideKey: "Hide",
      dataApiTitle: "Data API Settings",
      dataApiDesc: "When enabled, all warehouse stock adjustments trigger real-time webhook events to channels.",
      saveChanges: "Save Preferences",
    },
  }[lang];

  const emilDesignAudits = [
    {
      before: "Hardcoded ad-hoc UI buttons & cards",
      after: "Reusable UI Suite in src/components/ui (Button, Card, SegmentedControl, Input, Badge, Tooltip)",
      why: "Encapsulates craft defaults so the entire codebase inherits concentric radii and tactile springs.",
    },
    {
      before: "Manual radio buttons for theme toggle",
      after: "<SegmentedControl /> with spring sliding pill indicator",
      why: "Layout continuity makes state change spatial and physical rather than jarring.",
    },
    {
      before: "Untuned copy button feedback",
      after: "<CopyInput /> with asymmetric 120ms enter checkmark, 180ms ease-out snap back",
      why: "Fast where the system is confirming; slow where the user is deciding.",
    },
    {
      before: "scale(0) on tooltips and popovers",
      after: "<Tooltip /> entering from scale(0.95) with opacity: 0 and origin anchor",
      why: "Nothing in physical reality appears from zero; starting from 0.95 feels natural.",
    },
    {
      before: "Unconditional hover states",
      after: "@media (hover: hover) and (pointer: fine) gating across UI suite",
      why: "Prevents sticky hover states on touchscreens and mobile devices.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Description */}
      <div className="pb-1 border-b border-border-subtle">
        <h2 className="text-2xl font-black tracking-tight text-black-primary">
          {t.settingsTitle}
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          {t.settingsSubtitle}
        </p>
      </div>

      {/* CARD 1: THEME / APPEARANCE (FUNCTIONAL WORKING SETTING) */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.themeCardTitle}</CardTitle>
            <CardDescription>{t.themeCardDesc}</CardDescription>
          </div>

          <SegmentedControl
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: t.themeLight, icon: Icons.Sun },
              { value: "dark", label: t.themeDark, icon: Icons.Moon },
            ]}
          />
        </CardHeader>
      </Card>

      {/* CARD 2: LANGUAGE SETTINGS (FUNCTIONAL WORKING SETTING) */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.langCardTitle}</CardTitle>
            <CardDescription>{t.langCardDesc}</CardDescription>
          </div>

          <SegmentedControl
            value={lang}
            onChange={setLang}
            options={[
              { value: "id", label: "Bahasa Indonesia", icon: Icons.LanguageID },
              { value: "en", label: "English (US)", icon: Icons.LanguageEN },
            ]}
          />
        </CardHeader>
        <CardFooter>
          <div className="flex items-center gap-2">
            <Badge variant="yellow" dot size="sm">
              {t.langActivePill}
            </Badge>
            <span className="text-text-secondary text-xs">
              {t.langActiveDesc}
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Locale: {lang === "id" ? "id-ID" : "en-US"}
          </span>
        </CardFooter>
      </Card>

      {/* CARD 3: INVENTORY ENDPOINT */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.apiCardTitle}</CardTitle>
            <CardDescription>{t.apiCardDesc}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-xl">
            <CopyInput
              value="https://api.choral.id/v1/warehouse-central"
              labels={{ copy: t.copy, copied: t.copied }}
            />
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: API ACCESS KEYS */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t.apiKeysTitle}</CardTitle>
            <CardDescription>{t.apiKeysDesc}</CardDescription>
          </div>
          <Button variant="secondary" size="sm">
            {t.clientDocsBtn}
          </Button>
        </CardHeader>

        <CardContent className="divide-y divide-border-subtle p-0">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-md">
              <div className="text-xs font-bold text-black-primary">{t.publicKeyLabel}</div>
              <div className="text-xs text-text-secondary mt-0.5">{t.publicKeyDesc}</div>
            </div>
            <div className="w-full md:w-80">
              <CopyInput
                value="chr_pk_live_89f02931bc47901192"
                labels={{ copy: t.copy, copied: t.copied }}
              />
            </div>
          </div>

          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-md">
              <div className="text-xs font-bold text-black-primary">{t.secretKeyLabel}</div>
              <div className="text-xs text-text-secondary mt-0.5">{t.secretKeyDesc}</div>
            </div>
            <div className="w-full md:w-80">
              <CopyInput
                value="chr_sk_live_9201948ba028472911"
                masked
                allowReveal
                labels={{
                  copy: t.copy,
                  copied: t.copied,
                  show: t.showKey,
                  hide: t.hideKey,
                }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-start sm:items-center gap-2.5">
            <Badge variant="yellow" size="sm">
              {t.upcomingChange}
            </Badge>
            <span className="text-xs text-text-secondary">
              {t.upcomingDesc}
            </span>
          </div>
          <Button variant="secondary" size="sm">
            {t.readAnnouncement}
          </Button>
        </CardFooter>
      </Card>

      {/* CARD 4.5: FIREBASE REALTIME & DATA MIGRATION */}
      <Card className="border-accent-yellow/30 bg-surface-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-yellow font-mono">
                  Cloud Firestore Realtime Backend
                </span>
                <Badge variant="yellow" size="sm">Spark 100% Free</Badge>
              </div>
              <CardTitle className="mt-1">
                {lang === "id" ? "Manajemen Data Inventaris & Realtime Sync" : "Inventory Data & Realtime Sync"}
              </CardTitle>
            </div>
            <Badge variant="neutral">Modular CSV/XLSX Ready</Badge>
          </div>
          <CardDescription>
            {lang === "id"
              ? "Inisialisasi koleksi data persediaan awal ke Firestore atau sinkronisasi massal SKU gudang CHORAL.ID lengkap dengan kode barcode."
              : "Initialize initial inventory stock to Firestore or bulk-synchronize CHORAL.ID warehouse SKUs with barcode codes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {seedResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${seedResult.success
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
            >
              <span className="font-bold">{seedResult.success ? "✓" : "✕"}</span>
              <span className="leading-relaxed">{seedResult.message}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-text-primary">
                {lang === "id" ? "Inisialisasi Master Data Stok (Seed)" : "Seed Master Stock Data"}
              </div>
              <div className="text-[11px] text-text-secondary leading-relaxed max-w-lg">
                {lang === "id"
                  ? "Mengunggah data persediaan awal dari katalog CHORAL.ID ke Firestore menggunakan batch write yang aman. Siap digantikan uploader CSV/XLSX untuk update berkala."
                  : "Uploads sample CHORAL.ID catalog to Firestore via safe batch writes. Ready to be replaced by CSV/XLSX uploader."}
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="shrink-0 font-bold tracking-wide"
            >
              {isSeeding ? "Memproses Data..." : "Inisialisasi Data Awal"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CARD 5: DATA API SETTINGS */}
      <Card>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{t.dataApiTitle}</CardTitle>
            <CardDescription>{t.dataApiDesc}</CardDescription>
          </div>
          <Button variant="neon" size="md">
            {t.saveChanges}
          </Button>
        </div>
      </Card>

      {/* Emil Kowalski Standards Review Table */}
      <Card>
        <CardHeader>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-yellow-hover font-mono">
              /emil-design-eng &amp; UI Architecture
            </span>
            <CardTitle className="mt-0.5">
              Global UI Suite Refactoring Review
            </CardTitle>
          </div>
          <Badge variant="neutral">src/components/ui</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Before</TableHead>
                <TableHead>After</TableHead>
                <TableHead>Why (Emil Kowalski Philosophy)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emilDesignAudits.map((audit, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-[11px] text-text-muted">{audit.before}</TableCell>
                  <TableCell className="font-mono text-[11px] text-black-primary font-bold">{audit.after}</TableCell>
                  <TableCell className="text-text-secondary">{audit.why}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export { SettingsView };

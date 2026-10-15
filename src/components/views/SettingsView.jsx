"use client";

import React from "react";
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
  Icons,
} from "../ui";
import { useAppConfig } from "../providers/AppProvider";

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
    <div className="space-y-6">
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

        <CardContent className="divide-y divide-border-subtle p-0 space-y-0">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted text-text-secondary font-semibold">
                <tr>
                  <th className="p-3 border-b border-border-subtle">Before</th>
                  <th className="p-3 border-b border-border-subtle">After</th>
                  <th className="p-3 border-b border-border-subtle">Why (Emil Kowalski Philosophy)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {emilDesignAudits.map((audit, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                    <td className="p-3 font-mono text-[11px] text-text-muted">{audit.before}</td>
                    <td className="p-3 font-mono text-[11px] text-black-primary font-bold">{audit.after}</td>
                    <td className="p-3 text-text-secondary">{audit.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

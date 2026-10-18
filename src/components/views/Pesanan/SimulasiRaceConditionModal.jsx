"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icons,
} from "@/components/ui";
import { simulateRaceConditionTest } from "@/lib/services/inventory-service";
import { cn } from "@/lib/utils/utils";

export default function SimulasiRaceConditionModal({
  isOpen,
  onClose,
  inventoryItems = [],
  lang = "id",
}) {
  const [selectedSku, setSelectedSku] = useState("");
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  // Selected item data
  const selectedItem = inventoryItems.find(
    (i) => String(i.sku).toUpperCase() === String(selectedSku).toUpperCase()
  );

  const availableStock = selectedItem ? selectedItem.availableStock ?? 0 : 0;

  const handleRunSimulation = async () => {
    if (!selectedSku) return;

    setRunning(true);
    setTestResult(null);

    try {
      const res = await simulateRaceConditionTest({ sku: selectedSku });
      setTestResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-surface-elevated border border-border-default shadow-2xl p-6 sm:p-7 flex flex-col gap-5 my-8 text-black-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight">
                {lang === "id"
                  ? "⚡ Concurrency Lab: Simulasi Race Condition"
                  : "⚡ Concurrency Lab: Race Condition Simulation"}
              </h3>
              <Badge variant="yellow" size="sm">
                Stress Test
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Mengeksekusi dua pesanan paralel di milidetik yang sama menggunakan Promise.all() untuk menguji transaksi atomik Firestore."
                : "Executes two parallel orders in the exact same millisecond using Promise.all() to stress-test Firestore atomic transactions."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-black-primary hover:bg-surface-muted transition-colors"
          >
            <Icons.Close className="h-5 w-5" />
          </button>
        </div>

        {/* Skenario Penjelasan */}
        <div className="p-4 rounded-xl bg-surface-muted/70 border border-border-subtle flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-black-primary">
            <Icons.Layers className="h-4 w-4 text-accent-yellow" />
            <span>Skenario Pengujian (High Concurrency Flash Sale):</span>
          </div>
          <p className="text-text-secondary leading-relaxed">
            Dua pembeli (User A via <strong>Shopee API</strong> dan User B via <strong>TikTok Shop API</strong>)
            melakukan checkout untuk produk yang sama pada timestamp milidetik yang sama persis.
            Sistem <strong>Two-Phase Commit</strong> kami harus menjamin tepat satu transaksi yang lolos booking stok,
            dan transaksi lainnya ditolak dengan aman tanpa menyebabkan overselling / saldo stok minus.
          </p>
        </div>

        {/* Pilih SKU untuk Pengujian */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-black-primary">
            Pilih SKU untuk Diuji <span className="text-accent-red">*</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              value={selectedSku}
              onChange={(e) => {
                setSelectedSku(e.target.value);
                setTestResult(null);
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow font-mono"
            >
              <option value="">-- Pilih Produk untuk Ditest --</option>
              {inventoryItems.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} - {item.namaProduk} (Stok Tersedia: {item.availableStock ?? 0} pcs)
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={running ? Icons.Loader : Icons.Zap}
              disabled={running || !selectedSku}
              onClick={handleRunSimulation}
              className={cn("shrink-0", running && "animate-pulse")}
            >
              {running ? "Mengeksekusi Paralel..." : "Jalankan Simulasi (2 User Bersamaan)"}
            </Button>
          </div>

          {selectedItem && (
            <div className="flex items-center justify-between text-xs text-text-muted mt-1 px-1">
              <span>
                Stok Tersedia Saat Ini:{" "}
                <strong className={cn("font-mono", availableStock <= 1 ? "text-accent-red" : "text-black-primary")}>
                  {availableStock} pcs
                </strong>
              </span>
              <span>Total Fisik: {selectedItem.totalStock ?? 0} pcs</span>
            </div>
          )}
        </div>

        {/* HASIL SIMULASI REALTIME */}
        {testResult && (
          <div className="flex flex-col gap-4 animate-fade-in pt-2 border-t border-border-subtle">
            {/* Summary Banner */}
            <div
              className={cn(
                "p-4 rounded-xl border flex flex-col gap-1.5 text-xs",
                testResult.raceConditionPrevented
                  ? "bg-accent-yellow/15 border-accent-yellow/40 text-black-primary"
                  : "bg-surface-muted border-border-subtle text-text-secondary"
              )}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-accent-yellow-hover">
                <Icons.ShieldCheck className="h-5 w-5" />
                <span>
                  {testResult.raceConditionPrevented
                    ? "🛡️ RACE CONDITION BERHASIL DICEGAH DENGAN SEMPURNA!"
                    : "Laporan Hasil Eksekusi Concurrency"}
                </span>
              </div>
              <p className="font-medium">{testResult.summary}</p>
            </div>

            {/* Side-by-Side Threads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Thread 1: Shopee */}
              <div
                className={cn(
                  "p-4 rounded-xl border flex flex-col gap-2 text-xs",
                  testResult.threadA?.success
                    ? "bg-surface-elevated border-accent-yellow/50 shadow-sm"
                    : "bg-surface-muted/40 border-accent-red/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-text-muted uppercase">
                    Thread 01 • Shopee API
                  </span>
                  <Badge variant={testResult.threadA?.success ? "yellow" : "red"} size="xs">
                    {testResult.threadA?.success ? "BERHASIL (200 OK)" : "DITOLAK (BLOCKED)"}
                  </Badge>
                </div>

                <div className="font-bold text-black-primary">
                  Order #{testResult.orderIdA}
                </div>

                {testResult.threadA?.success ? (
                  <div className="text-[11px] text-text-secondary flex flex-col gap-1">
                    <span>✅ Transaksi atomik berhasil commit.</span>
                    <span>Stok berhasil dikunci (Reserved: +1 pcs).</span>
                    <span className="font-mono font-bold text-black-primary">
                      Sisa Available: {testResult.threadA.availableStock} pcs
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-accent-red flex flex-col gap-1">
                    <span>🛑 Transaksi ditolak oleh Firestore guard:</span>
                    <span className="font-mono bg-accent-red/10 p-1.5 rounded text-[10px]">
                      {testResult.threadA?.error || "Gagal alokasi stok."}
                    </span>
                  </div>
                )}
              </div>

              {/* Thread 2: TikTok Shop */}
              <div
                className={cn(
                  "p-4 rounded-xl border flex flex-col gap-2 text-xs",
                  testResult.threadB?.success
                    ? "bg-surface-elevated border-accent-yellow/50 shadow-sm"
                    : "bg-surface-muted/40 border-accent-red/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-text-muted uppercase">
                    Thread 02 • TikTok Shop API
                  </span>
                  <Badge variant={testResult.threadB?.success ? "yellow" : "red"} size="xs">
                    {testResult.threadB?.success ? "BERHASIL (200 OK)" : "DITOLAK (BLOCKED)"}
                  </Badge>
                </div>

                <div className="font-bold text-black-primary">
                  Order #{testResult.orderIdB}
                </div>

                {testResult.threadB?.success ? (
                  <div className="text-[11px] text-text-secondary flex flex-col gap-1">
                    <span>✅ Transaksi atomik berhasil commit.</span>
                    <span>Stok berhasil dikunci (Reserved: +1 pcs).</span>
                    <span className="font-mono font-bold text-black-primary">
                      Sisa Available: {testResult.threadB.availableStock} pcs
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-accent-red flex flex-col gap-1">
                    <span>🛑 Transaksi ditolak oleh Firestore guard:</span>
                    <span className="font-mono bg-accent-red/10 p-1.5 rounded text-[10px]">
                      {testResult.threadB?.error || "Gagal alokasi stok."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <span className="text-[10px] font-mono text-text-muted">
            Firestore Concurrency Isolation: Serialized Transactions
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

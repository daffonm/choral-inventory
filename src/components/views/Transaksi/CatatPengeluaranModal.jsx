"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Input,
  Icons,
} from "@/components/ui";
import { createOutboundTransactionAtomic } from "@/lib/services/inventory-service";
import { cn } from "@/lib/utils/utils";

const CATEGORIES = [
  { id: "fulfillment", label: "01. Fulfillment", desc: "Pesanan Marketplace / Pelanggan", badge: "yellow" },
  { id: "internal_usage", label: "02. Internal Usage", desc: "Seragam, Kru & Sample Photoshoot", badge: "neutral" },
  { id: "damaged", label: "03. Damaged", desc: "Karantina Cacat Jahitan & Scrap Reject", badge: "red" },
  { id: "adjustment", label: "04. Adjustment", desc: "Koreksi Selisih Stok Opname", badge: "neutral" },
];

export default function CatatPengeluaranModal({
  isOpen,
  onClose,
  inventoryItems = [],
  lang = "id",
}) {
  const [selectedSku, setSelectedSku] = useState("");
  const [category, setCategory] = useState("internal_usage");
  const [quantity, setQuantity] = useState("1");
  const [recipient, setRecipient] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  if (!isOpen) return null;

  // Selected item data
  const selectedItem = inventoryItems.find(
    (i) => String(i.sku).toUpperCase() === String(selectedSku).toUpperCase()
  );

  const availableStock = selectedItem ? selectedItem.availableStock ?? 0 : 0;
  const currentTotalStock = selectedItem ? selectedItem.totalStock ?? 0 : 0;
  const parsedQty = parseInt(quantity, 10) || 0;
  const isOverStock = parsedQty > availableStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSku) {
      setErrorMessage("Silakan pilih produk yang akan dikeluarkan.");
      return;
    }
    if (parsedQty <= 0) {
      setErrorMessage("Jumlah quantity harus lebih dari 0.");
      return;
    }
    if (isOverStock) {
      setErrorMessage(
        `Pengeluaran (${parsedQty} pcs) melebihi stok tersedia (${availableStock} pcs).`
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessInfo(null);

    try {
      const res = await createOutboundTransactionAtomic({
        sku: selectedSku,
        quantity: parsedQty,
        category,
        reason: reason.trim(),
        recipient: recipient.trim() || "Staf Gudang",
      });

      if (res.success) {
        setSuccessInfo(res);
        // Reset inputs
        setQuantity("1");
        setReason("");
        setRecipient("");
      } else {
        setErrorMessage(res.error || "Gagal mencatat transaksi.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan internal saat mencatat pengeluaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface-elevated border border-border-default shadow-2xl p-6 sm:p-7 flex flex-col gap-5 my-8 text-black-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight">
                {lang === "id" ? "Catat Barang Keluar (Goods Issue)" : "Record Goods Issue"}
              </h3>
              <Badge variant="yellow" size="sm">
                Atomic Guard ⚡
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Dilindungi transaksi atomik Firestore untuk mencegah overselling & race condition antar admin."
                : "Protected by Firestore atomic transactions to prevent overselling & concurrency race conditions."}
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

        {/* Success Alert */}
        {successInfo && (
          <div className="p-4 rounded-xl bg-accent-yellow/15 border border-accent-yellow/40 flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-accent-yellow-hover">
              <Icons.CheckCircle className="h-4 w-4" />
              <span>Transaksi Pengeluaran Berhasil Dicatat!</span>
            </div>
            <p className="text-text-secondary">
              ID Transaksi: <strong className="font-mono text-black-primary">{successInfo.txId}</strong>.
              Sisa stok tersedia untuk SKU {successInfo.sku} kini:{" "}
              <strong className="text-black-primary">{successInfo.availableStock} Pcs</strong>.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/30 flex items-start gap-2.5 text-xs text-accent-red">
            <Icons.AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 1. Pilih Kategori Pengeluaran */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black-primary">
              1. Kategori Pengeluaran <span className="text-accent-red">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all flex flex-col gap-0.5",
                    category === cat.id
                      ? "border-accent-yellow bg-accent-yellow/10 shadow-sm"
                      : "border-border-subtle bg-surface-muted/40 hover:border-border-default hover:bg-surface-muted/70"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black-primary">{cat.label}</span>
                    <Badge variant={cat.badge} size="xs">
                      {category === cat.id ? "Dipilih" : "Pilih"}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-text-muted">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih SKU / Produk */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black-primary">
              2. Pilih SKU Produk <span className="text-accent-red">*</span>
            </label>
            <select
              value={selectedSku}
              onChange={(e) => {
                setSelectedSku(e.target.value);
                setErrorMessage("");
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow font-mono"
            >
              <option value="">-- Pilih Produk Inventaris --</option>
              {inventoryItems.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} - {item.namaProduk} (Stok Tersedia: {item.availableStock ?? 0} pcs)
                </option>
              ))}
            </select>

            {/* Live Stock Indicators */}
            {selectedItem && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-muted/70 border border-border-subtle text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Stok Tersedia Saat Ini:</span>
                  <Badge
                    variant={availableStock <= 5 ? "red" : availableStock <= 20 ? "yellow" : "neutral"}
                    size="sm"
                  >
                    {availableStock} Pcs
                  </Badge>
                </div>
                <div className="text-[11px] text-text-muted font-mono">
                  Total Fisik: {currentTotalStock} Pcs
                </div>
              </div>
            )}
          </div>

          {/* 3. Jumlah Quantity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-black-primary">
                3. Jumlah Unit (Quantity) <span className="text-accent-red">*</span>
              </label>
              {selectedItem && (
                <span className="text-[11px] text-text-muted">
                  Maksimum keluar: <strong>{availableStock} pcs</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max={availableStock > 0 ? availableStock : 1}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrorMessage("");
                }}
                className={cn(
                  "font-mono font-bold text-sm",
                  isOverStock && "border-accent-red focus:border-accent-red text-accent-red"
                )}
                placeholder="Jumlah unit..."
              />
              <div className="flex items-center gap-1">
                {[1, 5, 10].map((quick) => (
                  <Button
                    key={quick}
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => setQuantity(String(quick))}
                  >
                    +{quick}
                  </Button>
                ))}
              </div>
            </div>

            {isOverStock && (
              <p className="text-[11px] font-medium text-accent-red">
                ⚠️ Jumlah melebihi stok sisa! Transaksi akan otomatis ditolak untuk mencegah minus.
              </p>
            )}
          </div>

          {/* 4. Penerima / PIC & Alasan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black-primary">Petugas / Penerima</label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="cth: Kru Photoshoot, Budi"
                className="text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black-primary">Keterangan / Alasan</label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="cth: Sampel endorse / cacat resleting"
                className="text-xs"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-2 pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
            <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
              <Icons.ShieldCheck className="h-3.5 w-3.5 text-accent-yellow" />
              ACID Safe Transaction
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                Tutup
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={loading ? Icons.Loader : Icons.Check}
                disabled={loading || !selectedSku || isOverStock || availableStock <= 0}
                className={cn(loading && "animate-pulse")}
              >
                {loading ? "Memproses..." : "Konfirmasi Pengeluaran"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Input,
  Icons,
} from "@/components/ui";
import { createOrderWithStockReservation } from "@/lib/services/inventory-service";
import { cn } from "@/lib/utils/utils";

const MARKETPLACES = [
  { id: "Shopee", label: "Shopee", channel: "Marketplace Shopee Mall" },
  { id: "TikTok Shop", label: "TikTok Shop", channel: "TikTok Live Shopping" },
  { id: "Tokopedia", label: "Tokopedia", channel: "Tokopedia Official Store" },
  { id: "Direct B2B", label: "B2B / Offline", channel: "Corporate Direct Order" },
];

export default function BuatOrderModal({
  isOpen,
  onClose,
  inventoryItems = [],
  lang = "id",
}) {
  const [orderId, setOrderId] = useState(`ORD-${Date.now().toString().slice(-6)}`);
  const [selectedSku, setSelectedSku] = useState("");
  const [marketplace, setMarketplace] = useState("Shopee");
  const [quantity, setQuantity] = useState("1");
  const [customer, setCustomer] = useState("");
  const [kurir, setKurir] = useState("J&T Express");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  if (!isOpen) return null;

  const selectedItem = inventoryItems.find(
    (i) => String(i.sku).toUpperCase() === String(selectedSku).toUpperCase()
  );

  const availableStock = selectedItem ? selectedItem.availableStock ?? 0 : 0;
  const currentTotalStock = selectedItem ? selectedItem.totalStock ?? 0 : 0;
  const currentReservedStock = selectedItem ? selectedItem.reservedStock ?? 0 : 0;
  const parsedQty = parseInt(quantity, 10) || 0;
  const isOverStock = parsedQty > availableStock;

  const handleGenerateOrderId = () => {
    setOrderId(`ORD-${Date.now().toString().slice(-6)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSku) {
      setErrorMessage("Silakan pilih produk yang dipesan.");
      return;
    }
    if (parsedQty <= 0) {
      setErrorMessage("Jumlah quantity pesanan harus lebih dari 0.");
      return;
    }
    if (isOverStock) {
      setErrorMessage(
        `Pesanan (${parsedQty} pcs) melebihi stok tersedia (${availableStock} pcs).`
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessInfo(null);

    const channelObj = MARKETPLACES.find((m) => m.id === marketplace);

    try {
      const res = await createOrderWithStockReservation({
        orderId: orderId.trim(),
        sku: selectedSku,
        quantity: parsedQty,
        marketplace,
        channel: channelObj?.channel || "Marketplace",
        customer: customer.trim() || "Customer Marketplace",
        kurir: kurir.trim(),
        catatan: catatan.trim(),
      });

      if (res.success) {
        setSuccessInfo(res);
        handleGenerateOrderId();
        setQuantity("1");
        setCustomer("");
        setCatatan("");
      } else {
        setErrorMessage(res.error || "Gagal membuat pesanan.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan internal saat membuat pesanan.");
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
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight">
                {lang === "id" ? "Buat Pesanan & Kunci Stok" : "New Order & Stock Booking"}
              </h3>
              <Badge variant="yellow" size="sm">
                Tahap 1: Booking
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {lang === "id"
                ? "Stok langsung dialokasikan ke reservedStock secara atomik sehingga channel lain tidak bisa menjualnya."
                : "Stock is immediately locked to reservedStock atomically preventing multi-channel overselling."}
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
              <span>Pesanan Berhasil Dibuat &amp; Stok Terkunci!</span>
            </div>
            <p className="text-text-secondary">
              Order ID: <strong className="font-mono text-black-primary">#{successInfo.orderId}</strong>.
              Stok Tersedia: <strong className="text-black-primary">{successInfo.availableStock} pcs</strong>,{" "}
              Stok Dibooking: <strong className="text-black-primary">{successInfo.reservedStock} pcs</strong>.
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
          {/* Order ID & Marketplace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black-primary">Order ID</label>
                <button
                  type="button"
                  onClick={handleGenerateOrderId}
                  className="text-[10px] text-accent-yellow-hover hover:underline font-mono"
                >
                  Auto Gen
                </button>
              </div>
              <Input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ORD-..."
                className="font-mono font-bold text-xs uppercase"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black-primary">Channel Penjualan</label>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow font-medium"
              >
                {MARKETPLACES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.channel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pilih SKU Produk */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-black-primary">
              Pilih SKU Produk <span className="text-accent-red">*</span>
            </label>
            <select
              value={selectedSku}
              onChange={(e) => {
                setSelectedSku(e.target.value);
                setErrorMessage("");
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface-muted border border-border-default text-black-primary focus:outline-none focus:border-accent-yellow font-mono"
              required
            >
              <option value="">-- Pilih Produk Inventaris --</option>
              {inventoryItems.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} - {item.namaProduk} (Tersedia: {item.availableStock ?? 0} pcs)
                </option>
              ))}
            </select>

            {/* Live Stock Indicators */}
            {selectedItem && (
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-muted/70 border border-border-subtle text-center text-xs">
                <div>
                  <span className="text-[10px] text-text-muted block">Tersedia (Ready)</span>
                  <strong className={cn("font-mono text-sm", availableStock <= 2 ? "text-accent-red" : "text-black-primary")}>
                    {availableStock} pcs
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Dibooking (Reserved)</span>
                  <strong className="font-mono text-sm text-accent-yellow-hover">
                    {currentReservedStock} pcs
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Total Fisik Gudang</span>
                  <strong className="font-mono text-sm text-text-secondary">
                    {currentTotalStock} pcs
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-black-primary">
                Jumlah Pesanan (Qty) <span className="text-accent-red">*</span>
              </label>
              {selectedItem && (
                <span className="text-[11px] text-text-muted">
                  Batas checkout: <strong>{availableStock} pcs</strong>
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
                  isOverStock && "border-accent-red text-accent-red"
                )}
                placeholder="1"
                required
              />
              <div className="flex items-center gap-1">
                {[1, 2, 5].map((q) => (
                  <Button
                    key={q}
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => setQuantity(String(q))}
                  >
                    {q} pcs
                  </Button>
                ))}
              </div>
            </div>

            {isOverStock && (
              <p className="text-[11px] font-medium text-accent-red">
                ⚠️ Stok tidak mencukupi! Sistem tidak akan mengizinkan pesanan ini disimpan.
              </p>
            )}
          </div>

          {/* Customer & Kurir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black-primary">Nama Pembeli</label>
              <Input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="cth: Dimas Anggara"
                className="text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-black-primary">Ekspedisi / Kurir</label>
              <Input
                value={kurir}
                onChange={(e) => setKurir(e.target.value)}
                placeholder="cth: J&T Express / SiCepat"
                className="text-xs"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-2 pt-3 border-t border-border-subtle flex items-center justify-between gap-3">
            <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
              <Icons.ShieldCheck className="h-3.5 w-3.5 text-accent-yellow" />
              Two-Phase Commit Guard
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={loading ? Icons.Loader : Icons.Check}
                disabled={loading || !selectedSku || isOverStock || availableStock <= 0}
                className={cn(loading && "animate-pulse")}
              >
                {loading ? "Mengunci Stok..." : "Buat & Kunci Stok"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

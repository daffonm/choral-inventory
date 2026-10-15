"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  SegmentedControl,
  Input,
  Icons,
} from "../ui";
import { useAppConfig } from "../providers/AppProvider";
import { masterData, formatNumber } from "../../lib";

export default function MasterDataView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("produk");
  const [searchFilter, setSearchFilter] = useState("");

  const { produk, material, supplier, gudang, channel } = masterData;

  const tabOptions = [
    { value: "produk", label: lang === "id" ? "Produk Jadi" : "Products", icon: Icons.ProductBag },
    { value: "material", label: lang === "id" ? "Material Bahan" : "Raw Materials", icon: Icons.MaterialFabric },
    { value: "supplier", label: lang === "id" ? "Supplier" : "Suppliers", icon: Icons.SupplierTruck },
    { value: "gudang", label: lang === "id" ? "Gudang & Rack" : "Warehouses", icon: Icons.Warehouse },
    { value: "channel", label: lang === "id" ? "Channel Distribusi" : "Channels", icon: Icons.ChannelGlobe },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Master Data Management" : "Master Data Management"}
            </h2>
            <Badge variant="yellow" size="sm">
              Single Source of Truth
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Katalog master SKU produk, spesifikasi bahan mentah, mitra supplier, lokasi rack gudang, dan channel penjualan."
              : "Master catalog of products, raw material specs, supplier vendors, warehouse rack locations, and sales channels."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Import Excel" : "Import Excel"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? `Tambah ${activeTab.toUpperCase()}` : `Add ${activeTab.toUpperCase()}`}
          </Button>
        </div>
      </div>

      {/* 2. Top Segmented Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={tabOptions}
        />

        <div className="w-full sm:w-64">
          <Input
            icon={Icons.Search}
            size="sm"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={lang === "id" ? `Cari di ${activeTab}...` : `Filter ${activeTab}...`}
          />
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: PRODUK */}
      {activeTab === "produk" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Daftar Master Produk Jadi" : "Finished Goods Catalog"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut lengkap: SKU, nama produk, kategori, variant, size, color, barcode, satuan, jenis barang"
                  : "Complete attributes: SKU, product name, category, variant, size, color, barcode, unit, item type"}
              </CardDescription>
            </div>
            <Badge variant="neutral">{produk.length} SKU Aktif</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Nama Produk</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Variant / Size</th>
                    <th className="p-3">Warna</th>
                    <th className="p-3">Barcode</th>
                    <th className="p-3">Satuan</th>
                    <th className="p-3">Jenis Barang</th>
                    <th className="p-3 text-right">Harga Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {produk
                    .filter((p) =>
                      p.namaProduk.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      p.sku.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.sku} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                        <td className="p-3 font-mono font-bold text-black-primary">
                          {item.sku}
                        </td>
                        <td className="p-3 font-semibold text-black-primary">
                          {item.namaProduk}
                        </td>
                        <td className="p-3">
                          <Badge variant="neutral" size="sm">{item.kategori}</Badge>
                        </td>
                        <td className="p-3 text-text-secondary">
                          {item.variant} &bull; <span className="font-mono">{item.size}</span>
                        </td>
                        <td className="p-3 text-text-secondary">{item.color}</td>
                        <td className="p-3 font-mono text-[11px] text-text-muted">
                          {item.barcode}
                        </td>
                        <td className="p-3">{item.satuan}</td>
                        <td className="p-3">
                          <Badge variant="yellow" size="sm">{item.jenisBarang}</Badge>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-black-primary">
                          Rp {formatNumber(item.price)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: MATERIAL */}
      {activeTab === "material" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Daftar Master Material Baku" : "Raw Materials & Fabrics"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Spesifikasi bahan: kode material, nama material, jenis material, satuan"
                  : "Material specifications: material code, material name, material type, unit"}
              </CardDescription>
            </div>
            <Badge variant="neutral">{material.length} Jenis Bahan</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Kode Material</th>
                    <th className="p-3">Nama Material</th>
                    <th className="p-3">Jenis Material</th>
                    <th className="p-3">Satuan</th>
                    <th className="p-3">Stok Tersedia</th>
                    <th className="p-3">Supplier Utama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {material
                    .filter((m) =>
                      m.namaMaterial.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      m.kodeMaterial.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((item) => (
                      <tr key={item.kodeMaterial} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                        <td className="p-3 font-mono font-bold text-black-primary">
                          {item.kodeMaterial}
                        </td>
                        <td className="p-3 font-semibold text-black-primary">
                          {item.namaMaterial}
                        </td>
                        <td className="p-3">
                          <Badge variant="neutral" size="sm">{item.jenisMaterial}</Badge>
                        </td>
                        <td className="p-3 font-mono">{item.satuan}</td>
                        <td className="p-3 font-mono font-bold text-black-primary">
                          {item.stokTersedia} {item.satuan}
                        </td>
                        <td className="p-3 text-text-secondary">{item.supplierUtama}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SUPPLIER */}
      {activeTab === "supplier" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Daftar Mitra Supplier" : "Vendor & Suppliers Directory"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Atribut: nama supplier, kontak supplier, jenis barang supplier"
                  : "Attributes: supplier name, supplier contact, supplied goods type"}
              </CardDescription>
            </div>
            <Badge variant="neutral">{supplier.length} Rekanan Aktif</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">Nama Supplier</th>
                    <th className="p-3">Kontak Supplier</th>
                    <th className="p-3">Jenis Barang Supplier</th>
                    <th className="p-3">Lokasi / Kota</th>
                    <th className="p-3">Lead Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {supplier
                    .filter((s) =>
                      s.namaSupplier.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      s.jenisBarangSupplier.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                        <td className="p-3 font-bold text-black-primary">
                          {item.namaSupplier}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-text-secondary">
                          {item.kontakSupplier}
                        </td>
                        <td className="p-3">
                          <Badge variant="yellow" size="sm">{item.jenisBarangSupplier}</Badge>
                        </td>
                        <td className="p-3 text-text-secondary">{item.kota}</td>
                        <td className="p-3 font-mono font-semibold text-black-primary">
                          {item.leadTime}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: GUDANG */}
      {activeTab === "gudang" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gudang.map((g, idx) => (
            <Card key={idx} className="hover:border-accent-yellow/50 transition-[border-color] duration-150 ease-out">
              <CardHeader>
                <div>
                  <div className="text-[10px] font-mono font-bold text-accent-yellow-hover uppercase tracking-wider">
                    Fasilitas Gudang &bull; CHORAL.ID
                  </div>
                  <CardTitle className="mt-1">{g.namaGudang}</CardTitle>
                </div>
                <Badge variant="neutral" size="sm">Kapasitas: {g.kapasitasMax}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-text-secondary block">
                    {lang === "id" ? "Lokasi Penyimpanan:" : "Storage Location:"}
                  </span>
                  <span className="text-xs font-medium text-black-primary">
                    {g.lokasiPenyimpanan}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-text-secondary block">
                    {lang === "id" ? "Rack / Area Alokasi:" : "Rack / Designated Area:"}
                  </span>
                  <span className="text-xs font-mono font-bold text-accent-yellow-hover bg-surface-muted px-2 py-1 rounded inline-block mt-0.5 border border-border-subtle">
                    {g.rackArea}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-text-muted justify-between">
                <span>PIC: {g.penanggungJawab}</span>
                <span className="font-semibold text-black-primary">Status: Operational</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 5: CHANNEL */}
      {activeTab === "channel" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{lang === "id" ? "Channel Distribusi Penjualan" : "Distribution & Sales Channels"}</CardTitle>
              <CardDescription>
                {lang === "id"
                  ? "Channel terintegrasi: Shopee, TikTok Shop, Bazaar, Consignment, Internal, Free Stuff, Sample"
                  : "Integrated channels: Shopee, TikTok Shop, Bazaar, Consignment, Internal, Free Stuff, Sample"}
              </CardDescription>
            </div>
            <Badge variant="yellow" size="sm">7 Channel Aktif</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle">
                  <tr>
                    <th className="p-3">ID Channel</th>
                    <th className="p-3">Nama Channel</th>
                    <th className="p-3">Tipe Saluran</th>
                    <th className="p-3">Biaya / Komisi</th>
                    <th className="p-3">Alokasi Stok Fisik</th>
                    <th className="p-3">Penanggung Jawab (PIC)</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-primary">
                  {channel.map((item) => (
                    <tr key={item.channelId} className="hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out">
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {item.channelId}
                      </td>
                      <td className="p-3 font-bold text-black-primary">
                        {item.namaChannel}
                      </td>
                      <td className="p-3">
                        <Badge variant="neutral" size="sm">{item.tipe}</Badge>
                      </td>
                      <td className="p-3 font-mono">{item.komisi}</td>
                      <td className="p-3 font-mono font-bold text-black-primary">
                        {formatNumber(item.stokDialokasikan)} pcs
                      </td>
                      <td className="p-3 text-text-secondary">{item.pic}</td>
                      <td className="p-3 text-right">
                        <Badge variant="yellow" dot size="sm">{item.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

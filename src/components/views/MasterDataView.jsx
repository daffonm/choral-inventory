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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
    <div className="flex flex-col gap-6">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Variant / Size</TableHead>
                  <TableHead>Warna</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Jenis Barang</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produk
                  .filter((p) =>
                    p.namaProduk.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="font-mono font-bold text-black-primary">
                        {item.sku}
                      </TableCell>
                      <TableCell className="font-semibold text-black-primary">
                        {item.namaProduk}
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" size="sm">{item.kategori}</Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {item.variant} &bull; <span className="font-mono">{item.size}</span>
                      </TableCell>
                      <TableCell className="text-text-secondary">{item.color}</TableCell>
                      <TableCell className="font-mono text-[11px] text-text-muted">
                        {item.barcode}
                      </TableCell>
                      <TableCell>{item.satuan}</TableCell>
                      <TableCell>
                        <Badge variant="yellow" size="sm">{item.jenisBarang}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-black-primary">
                        Rp {formatNumber(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Material</TableHead>
                  <TableHead>Nama Material</TableHead>
                  <TableHead>Jenis Material</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Stok Tersedia</TableHead>
                  <TableHead>Supplier Utama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {material
                  .filter((m) =>
                    m.namaMaterial.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    m.kodeMaterial.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((item) => (
                    <TableRow key={item.kodeMaterial}>
                      <TableCell className="font-mono font-bold text-black-primary">
                        {item.kodeMaterial}
                      </TableCell>
                      <TableCell className="font-semibold text-black-primary">
                        {item.namaMaterial}
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral" size="sm">{item.jenisMaterial}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{item.satuan}</TableCell>
                      <TableCell className="font-mono font-bold text-black-primary">
                        {item.stokTersedia} {item.satuan}
                      </TableCell>
                      <TableCell className="text-text-secondary">{item.supplierUtama}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Supplier</TableHead>
                  <TableHead>Kontak Supplier</TableHead>
                  <TableHead>Jenis Barang Supplier</TableHead>
                  <TableHead>Lokasi / Kota</TableHead>
                  <TableHead>Lead Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplier
                  .filter((s) =>
                    s.namaSupplier.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    s.jenisBarangSupplier.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-black-primary">
                        {item.namaSupplier}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-text-secondary">
                        {item.kontakSupplier}
                      </TableCell>
                      <TableCell>
                        <Badge variant="yellow" size="sm">{item.jenisBarangSupplier}</Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary">{item.kota}</TableCell>
                      <TableCell className="font-mono font-semibold text-black-primary">
                        {item.leadTime}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
              <CardContent className="flex flex-col gap-3">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Channel</TableHead>
                  <TableHead>Nama Channel</TableHead>
                  <TableHead>Tipe Saluran</TableHead>
                  <TableHead>Biaya / Komisi</TableHead>
                  <TableHead>Alokasi Stok Fisik</TableHead>
                  <TableHead>Penanggung Jawab (PIC)</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channel.map((item) => (
                  <TableRow key={item.channelId}>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {item.channelId}
                    </TableCell>
                    <TableCell className="font-bold text-black-primary">
                      {item.namaChannel}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">{item.tipe}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">{item.komisi}</TableCell>
                    <TableCell className="font-mono font-bold text-black-primary">
                      {formatNumber(item.stokDialokasikan)} pcs
                    </TableCell>
                    <TableCell className="text-text-secondary">{item.pic}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="yellow" dot size="sm">{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

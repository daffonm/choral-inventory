"use client";

import React, { useState, useMemo } from "react";
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
  SkeletonTable,
  EmptyState,
} from "@/components/ui";
import { useAppConfig } from "@/providers/AppProvider";
import { formatNumber, cn } from "@/lib/utils/utils";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import TambahProdukView from "./TambahProdukView";
import TambahMaterialView from "./TambahMaterialView";
import TambahSupplierView from "./TambahSupplierView";
import TambahGudangView from "./TambahGudangView";
import TambahChannelView from "./TambahChannelView";

export default function MasterDataView({ lang: propLang }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [activeTab, setActiveTab] = useState("produk");
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "create_produk" | "create_material" | "create_supplier" | "create_gudang" | "create_channel"
  const [hasNavigated, setHasNavigated] = useState(false);

  // Integrasi realtime Firestore (tanpa fallback dummy data)
  const { data: produk, loading: loadingProduk } = useRealtimeCollection("master_products", {
    orderByField: "sku",
    orderDirection: "asc",
  });
  const { data: material, loading: loadingMaterial } = useRealtimeCollection("master_materials", {
    orderByField: "kodeMaterial",
    orderDirection: "asc",
  });
  const { data: supplier, loading: loadingSupplier } = useRealtimeCollection("master_suppliers");
  const { data: gudang, loading: loadingGudang } = useRealtimeCollection("master_warehouses");
  const { data: channel, loading: loadingChannel } = useRealtimeCollection("master_channels");

  const tabOptions = [
    { value: "produk", label: lang === "id" ? "Produk Jadi" : "Products", icon: Icons.ProductBag },
    { value: "material", label: lang === "id" ? "Material Bahan" : "Raw Materials", icon: Icons.MaterialFabric },
    { value: "supplier", label: lang === "id" ? "Supplier" : "Suppliers", icon: Icons.SupplierTruck },
    { value: "gudang", label: lang === "id" ? "Gudang & Rack" : "Warehouses", icon: Icons.Warehouse },
    { value: "channel", label: lang === "id" ? "Channel Distribusi" : "Channels", icon: Icons.ChannelGlobe },
  ];

  // Set real-time SKU & Kode terdaftar untuk validasi duplikasi instan O(1) tanpa biaya read tambahan
  const existingSkus = useMemo(() => {
    return new Set((produk || []).map((p) => String(p.sku || "").trim().toUpperCase()));
  }, [produk]);

  const existingMaterialCodes = useMemo(() => {
    return new Set((material || []).map((m) => String(m.kodeMaterial || "").trim().toUpperCase()));
  }, [material]);

  const existingSupplierCodes = useMemo(() => {
    return new Set((supplier || []).map((s) => String(s.kodeSupplier || "").trim().toUpperCase()));
  }, [supplier]);

  const existingWarehouseCodes = useMemo(() => {
    return new Set((gudang || []).map((g) => String(g.kodeGudang || "").trim().toUpperCase()));
  }, [gudang]);

  const existingChannelCodes = useMemo(() => {
    return new Set((channel || []).map((c) => String(c.channelId || c.kodeChannel || "").trim().toUpperCase()));
  }, [channel]);

  if (viewMode === "create_produk") {
    return (
      <TambahProdukView
        onBack={() => setViewMode("list")}
        existingSkus={existingSkus}
        lang={lang}
      />
    );
  }

  if (viewMode === "create_material") {
    return (
      <TambahMaterialView
        onBack={() => setViewMode("list")}
        existingCodes={existingMaterialCodes}
        suppliers={supplier || []}
        lang={lang}
      />
    );
  }

  if (viewMode === "create_supplier") {
    return (
      <TambahSupplierView
        onBack={() => setViewMode("list")}
        existingCodes={existingSupplierCodes}
        lang={lang}
      />
    );
  }

  if (viewMode === "create_gudang") {
    return (
      <TambahGudangView
        onBack={() => setViewMode("list")}
        existingCodes={existingWarehouseCodes}
        lang={lang}
      />
    );
  }

  if (viewMode === "create_channel") {
    return (
      <TambahChannelView
        onBack={() => setViewMode("list")}
        existingCodes={existingChannelCodes}
        lang={lang}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full", hasNavigated && "animate-view-slide-in-left")}>
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Master Data Management" : "Master Data Management"}
            </h2>
            <Badge variant="yellow" size="sm" dot>
              Live Firestore
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
          <Button
            variant="primary"
            size="sm"
            icon={Icons.Plus}
            onClick={() => {
              setHasNavigated(true);
              if (activeTab === "produk") setViewMode("create_produk");
              else if (activeTab === "material") setViewMode("create_material");
              else if (activeTab === "supplier") setViewMode("create_supplier");
              else if (activeTab === "gudang") setViewMode("create_gudang");
              else if (activeTab === "channel") setViewMode("create_channel");
            }}
          >
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
        loadingProduk ? (
          <SkeletonTable rows={5} columns={9} />
        ) : (
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
              <Badge variant="neutral">{produk.length} SKU Terdaftar</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {produk.length === 0 ? (
                <EmptyState
                  icon={Icons.ProductBag}
                  title="Belum Ada Master Produk"
                  description="Koleksi master_products di Firestore masih kosong. Tambahkan produk baru atau jalankan seeder manual."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Icons.Plus}
                      onClick={() => {
                        setHasNavigated(true);
                        setViewMode("create_produk");
                      }}
                    >
                      {lang === "id" ? "Tambah Produk Baru" : "Add New Product"}
                    </Button>
                  }
                />
              ) : (
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
                        (p.namaProduk || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
                        (p.sku || "").toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((item) => (
                        <TableRow key={item.sku || item.id}>
                          <TableCell className="font-mono font-bold text-black-primary">
                            {item.sku}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              {item.fotoUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={item.fotoUrl}
                                  alt={item.namaProduk}
                                  className="size-8 rounded-md object-cover border border-border-default shrink-0 shadow-2xs"
                                />
                              ) : (
                                <div className="size-8 rounded-md bg-surface-muted border border-border-subtle flex items-center justify-center text-text-muted shrink-0 text-xs">
                                  <Icons.ProductBag className="size-4 text-text-muted" />
                                </div>
                              )}
                              <span className="font-semibold text-black-primary">{item.namaProduk}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="neutral" size="sm">{item.kategori || "-"}</Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary">
                            {item.variant || "-"} &bull; <span className="font-mono">{item.size || "-"}</span>
                          </TableCell>
                          <TableCell className="text-text-secondary">{item.color || "-"}</TableCell>
                          <TableCell className="font-mono text-[11px] text-text-muted">
                            {item.barcode || "-"}
                          </TableCell>
                          <TableCell>{item.satuan || "Pcs"}</TableCell>
                          <TableCell>
                            <Badge variant="yellow" size="sm">{item.jenisBarang || "Produk Jadi"}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-black-primary">
                            Rp {formatNumber(item.price || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* TAB 2: MATERIAL */}
      {activeTab === "material" && (
        loadingMaterial ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
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
              {material.length === 0 ? (
                <EmptyState
                  icon={Icons.MaterialFabric}
                  title="Belum Ada Master Material"
                  description="Koleksi master_materials di Firestore masih kosong. Tambahkan material bahan baku untuk memulai produksi."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Icons.Plus}
                      onClick={() => {
                        setHasNavigated(true);
                        setViewMode("create_material");
                      }}
                    >
                      {lang === "id" ? "Tambah Material Baru" : "Add New Material"}
                    </Button>
                  }
                />
              ) : (
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
                        (m.namaMaterial || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
                        (m.kodeMaterial || "").toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((item) => (
                        <TableRow key={item.kodeMaterial || item.id}>
                          <TableCell className="font-mono font-bold text-black-primary">
                            {item.kodeMaterial}
                          </TableCell>
                          <TableCell className="font-semibold text-black-primary">
                            {item.namaMaterial}
                          </TableCell>
                          <TableCell>
                            <Badge variant="neutral" size="sm">{item.jenisMaterial || "-"}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{item.satuan || "Meter"}</TableCell>
                          <TableCell className="font-mono font-bold text-black-primary">
                            {formatNumber(item.stokTersedia || 0)} {item.satuan}
                          </TableCell>
                          <TableCell className="text-text-secondary">{item.supplierUtama || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* TAB 3: SUPPLIER */}
      {activeTab === "supplier" && (
        loadingSupplier ? (
          <SkeletonTable rows={5} columns={5} />
        ) : (
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
              {supplier.length === 0 ? (
                <EmptyState
                  icon={Icons.SupplierTruck}
                  title="Belum Ada Data Supplier"
                  description="Koleksi master_suppliers di Firestore masih kosong. Daftarkan mitra vendor bahan baku."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Icons.Plus}
                      onClick={() => {
                        setHasNavigated(true);
                        setViewMode("create_supplier");
                      }}
                    >
                      {lang === "id" ? "Daftarkan Supplier Baru" : "Register New Supplier"}
                    </Button>
                  }
                />
              ) : (
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
                        (s.namaSupplier || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
                        (s.jenisBarangSupplier || "").toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((item, idx) => (
                        <TableRow key={item.kodeSupplier || item.id || idx}>
                          <TableCell className="font-bold text-black-primary">
                            {item.namaSupplier}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-text-secondary">
                            {item.kontakSupplier || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="yellow" size="sm">{item.jenisBarangSupplier || "-"}</Badge>
                          </TableCell>
                          <TableCell className="text-text-secondary">{item.kota || "-"}</TableCell>
                          <TableCell className="font-mono font-semibold text-black-primary">
                            {item.leadTime || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* TAB 4: GUDANG */}
      {activeTab === "gudang" && (
        loadingGudang ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonTable rows={3} columns={3} />
            <SkeletonTable rows={3} columns={3} />
          </div>
        ) : gudang.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Icons.Warehouse}
                title="Belum Ada Data Fasilitas Gudang"
                description="Koleksi master_warehouses di Firestore masih kosong. Daftarkan gudang dan denah rack penyimpanan."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Icons.Plus}
                    onClick={() => {
                      setHasNavigated(true);
                      setViewMode("create_gudang");
                    }}
                  >
                    {lang === "id" ? "Tambah Fasilitas Gudang" : "Add Warehouse Facility"}
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gudang.map((g, idx) => (
              <Card key={g.kodeGudang || g.id || idx} className="hover:border-accent-yellow/50 transition-[border-color] duration-150 ease-out">
                <CardHeader>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-accent-yellow-hover uppercase tracking-wider">
                      Fasilitas Gudang &bull; CHORAL.ID
                    </div>
                    <CardTitle className="mt-1">{g.namaGudang}</CardTitle>
                  </div>
                  <Badge variant="neutral" size="sm">Kapasitas: {g.kapasitasMax || "-"}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-text-secondary block">
                      {lang === "id" ? "Lokasi Penyimpanan:" : "Storage Location:"}
                    </span>
                    <span className="text-xs font-medium text-black-primary">
                      {g.lokasiPenyimpanan || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-text-secondary block">
                      {lang === "id" ? "Rack / Area Alokasi:" : "Rack / Designated Area:"}
                    </span>
                    <span className="text-xs font-mono font-bold text-accent-yellow-hover bg-surface-muted px-2 py-1 rounded inline-block mt-0.5 border border-border-subtle">
                      {g.rackArea || "-"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-text-muted justify-between">
                  <span>PIC: {g.penanggungJawab || "-"}</span>
                  <span className="font-semibold text-black-primary">Status: Operational</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      )}

      {/* TAB 5: CHANNEL */}
      {activeTab === "channel" && (
        loadingChannel ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
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
              <Badge variant="yellow" size="sm">{channel.length} Channel Terdaftar</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {channel.length === 0 ? (
                <EmptyState
                  icon={Icons.ChannelGlobe}
                  title="Belum Ada Data Channel Distribusi"
                  description="Koleksi master_channels di Firestore masih kosong. Daftarkan kanal penjualan online dan offline."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Icons.Plus}
                      onClick={() => {
                        setHasNavigated(true);
                        setViewMode("create_channel");
                      }}
                    >
                      {lang === "id" ? "Daftarkan Channel Baru" : "Register New Channel"}
                    </Button>
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Channel</TableHead>
                      <TableHead>Nama Channel</TableHead>
                      <TableHead>Tipe Saluran</TableHead>
                      <TableHead>Biaya / Komisi</TableHead>
                      <TableHead>Siklus Settlement</TableHead>
                      <TableHead>Penanggung Jawab (PIC)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channel.map((item) => (
                      <TableRow key={item.channelId || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.channelId || item.kodeChannel}
                        </TableCell>
                        <TableCell className="font-bold text-black-primary">
                          {item.namaChannel}
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutral" size="sm">{item.tipe || "Direct"}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{item.komisi || "0%"}</TableCell>
                        <TableCell className="text-xs text-text-secondary">
                          {item.settlement || "H+1 Otomatis"}
                        </TableCell>
                        <TableCell className="text-text-secondary">{item.pic || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="yellow" dot size="sm">{item.status || "Active"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

export { MasterDataView };

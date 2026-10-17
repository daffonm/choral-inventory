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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Icons,
  SkeletonTable,
  EmptyState,
} from "../ui";
import { useAppConfig } from "../../providers/AppProvider";
import { formatNumber } from "@/lib/utils/utils";
import { useRealtimeInventory } from "@/lib/hooks/useRealtimeInventory";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";

export default function PersediaanView({ lang: propLang, initialTab = "stokSaatIni" }) {
  const { lang: contextLang } = useAppConfig();
  const lang = propLang || contextLang || "id";
  const [userTab, setUserTab] = useState(null);
  const activeTab = userTab || initialTab;
  const setActiveTab = setUserTab;

  // Realtime Firestore listeners
  const { items: stokSaatIni, loading: loadingStok, isLive } = useRealtimeInventory();
  const { data: pergerakanStok, loading: loadingMovements } = useRealtimeCollection("stock_movements");
  const { data: stockOpname, loading: loadingOpname } = useRealtimeCollection("stock_opname");
  const { data: channels, loading: loadingChannels } = useRealtimeCollection("master_channels");

  // Filter stok minimum secara realtime dari stokSaatIni
  const stokMinimumList = React.useMemo(() => {
    return stokSaatIni
      .filter((item) => (item.availableStock || 0) <= (item.minimumStock || 20))
      .map((item) => ({
        sku: item.sku,
        namaProduk: item.namaProduk,
        currentStock: item.availableStock || 0,
        minimumStock: item.minimumStock || 20,
        reorderPoint: `Order ${(item.minimumStock || 20) * 2} pcs segera ke vendor`,
        status: (item.availableStock || 0) <= (item.minimumStock || 20) / 2 ? "Kritis" : "Peringatan Menipis",
        priority: (item.availableStock || 0) <= (item.minimumStock || 20) / 2 ? "high" : "warning",
      }));
  }, [stokSaatIni]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-black-primary">
              {lang === "id" ? "Persediaan & Kontrol Inventaris" : "Inventory & Stock Control"}
            </h2>
            <Badge variant={isLive ? "yellow" : "neutral"} size="sm" dot={isLive}>
              {isLive ? "Live Firestore" : "Menghubungkan..."}
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {lang === "id"
              ? "Status stok realtime, kartu log mutasi pergerakan, alokasi multi-channel, selisih stock opname, dan peringatan buffer."
              : "Real-time stock levels, movement ledger, multi-channel allocations, stock take audits, and minimum threshold alerts."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Icons.Download}>
            {lang === "id" ? "Unduh Kartu Stok" : "Download Stock Card"}
          </Button>
          <Button variant="primary" size="sm" icon={Icons.Plus}>
            {lang === "id" ? "Catat Mutasi / Opname" : "New Stock Adjustment"}
          </Button>
        </div>
      </div>

      {/* TAB 1: STOK SAAT INI */}
      {activeTab === "stokSaatIni" && (
        loadingStok ? (
          <SkeletonTable rows={5} columns={8} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Stok Saat Ini (Per SKU)" : "Current Stock On-Hand"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: SKU, barcode, total stock, available stock, reserved stock, damaged stock"
                    : "Attributes: SKU, barcode, total stock, available stock, reserved stock, damaged stock"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isLive ? "yellow" : "neutral"} size="sm" dot>
                  {isLive ? `${stokSaatIni.length} SKU Live` : "Menghubungkan..."}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {stokSaatIni.length === 0 ? (
                <EmptyState
                  icon={Icons.InventoryBox}
                  title="Belum Ada Data Inventaris"
                  description="Koleksi inventory di Firestore masih kosong. Stok akan tampil otomatis saat dicatat atau di-seed."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU / Barcode</TableHead>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Lokasi Gudang</TableHead>
                      <TableHead className="text-right">Total Stock</TableHead>
                      <TableHead className="text-right">Available Stock</TableHead>
                      <TableHead className="text-right">Reserved Stock</TableHead>
                      <TableHead className="text-right">Damaged Stock</TableHead>
                      <TableHead className="text-right">Status Kesehatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stokSaatIni.map((item) => (
                      <TableRow key={item.sku || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          <div>{item.sku}</div>
                          {item.barcode && (
                            <div className="text-[10px] text-text-muted font-normal tracking-wider font-mono">
                              {item.barcode}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.namaProduk}
                        </TableCell>
                        <TableCell className="text-text-secondary font-mono text-[11px]">
                          {item.lokasiGudang || "Gudang Utama"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-black-primary">
                          {formatNumber(item.totalStock || 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-accent-yellow-hover">
                          {formatNumber(item.availableStock || 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-text-secondary">
                          {formatNumber(item.reservedStock || 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-accent-red font-semibold">
                          {formatNumber(item.damagedStock || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={item.statusKesehatan?.includes("Kritis") ? "red" : item.statusKesehatan?.includes("Menipis") ? "yellow" : "neutral"}
                            dot
                            size="sm"
                          >
                            {item.statusKesehatan || "Aman"}
                          </Badge>
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

      {/* TAB 2: PERGERAKAN STOK */}
      {activeTab === "pergerakan" && (
        loadingMovements ? (
          <SkeletonTable rows={5} columns={9} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Buku Mutasi & Pergerakan Stok" : "Stock Movement Audit Ledger"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: Movement ID, Transaction Type, SKU, Quantity, Source, Reason, User, Timestamp, Reference Transaction"
                    : "Attributes: Movement ID, Transaction Type, SKU, Quantity, Source, Reason, User, Timestamp, Reference Transaction"}
                </CardDescription>
              </div>
              <Badge variant="neutral">{pergerakanStok.length} Log Mutasi</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {pergerakanStok.length === 0 ? (
                <EmptyState
                  icon={Icons.HistoryMove}
                  title="Belum Ada Catatan Mutasi Stok"
                  description="Koleksi stock_movements masih kosong. Seluruh pergerakan barang keluar-masuk akan terekam otomatis di sini."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Movement ID</TableHead>
                      <TableHead>Transaction Type</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Source / Asal</TableHead>
                      <TableHead>Reason / Keterangan</TableHead>
                      <TableHead>Petugas (User)</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Ref. Trx</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pergerakanStok.map((item) => (
                      <TableRow key={item.movementId || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.movementId || item.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.quantity > 0 ? "yellow" : "neutral"} size="sm">
                            {item.transactionType || (item.quantity > 0 ? "Incoming" : "Outgoing")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-mono font-bold">
                          <span className={item.quantity > 0 ? "text-accent-yellow-hover" : "text-accent-red"}>
                            {item.quantity > 0 ? `+${item.quantity}` : item.quantity} pcs
                          </span>
                        </TableCell>
                        <TableCell className="text-text-secondary">{item.source || "Gudang Utama"}</TableCell>
                        <TableCell className="text-text-secondary">{item.reason || "-"}</TableCell>
                        <TableCell className="font-mono text-[11px] text-text-muted">{item.user || "System"}</TableCell>
                        <TableCell className="font-mono text-[11px] text-text-muted">
                          {item.timestamp?.seconds ? new Date(item.timestamp.seconds * 1000).toLocaleString("id-ID") : String(item.timestamp || "-")}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-text-muted">{item.referenceTransaction || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* TAB 3: ALOKASI STOK */}
      {activeTab === "alokasi" && (
        loadingChannels ? (
          <SkeletonTable rows={5} columns={5} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Alokasi Stok Multi-Channel" : "Multi-Channel Stock Allocations"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Alokasi persediaan fisik per channel penjualan (Shopee, TikTok, Offline Bazaar, Consignment)"
                    : "Physical inventory allocations across marketplace, offline retail, and consignment"}
                </CardDescription>
              </div>
              <Badge variant="yellow" size="sm">{channels.length} Channel</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {channels.length === 0 ? (
                <EmptyState
                  icon={Icons.ChannelGlobe}
                  title="Belum Ada Alokasi Channel"
                  description="Koleksi master_channels masih kosong. Tambahkan channel penjualan untuk melihat alokasi stok."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel Penjualan</TableHead>
                      <TableHead>Tipe Channel</TableHead>
                      <TableHead>Alokasi Stok Fisik</TableHead>
                      <TableHead>Komisi / Biaya</TableHead>
                      <TableHead className="text-right">Status Sinkronisasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channels.map((item, idx) => (
                      <TableRow key={item.channelId || item.id || idx}>
                        <TableCell className="font-bold text-black-primary">
                          {item.namaChannel}
                        </TableCell>
                        <TableCell className="font-semibold text-text-secondary">
                          {item.tipe || "Direct"}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {formatNumber(item.stokDialokasikan || 0)} pcs
                        </TableCell>
                        <TableCell className="font-mono text-text-secondary">{item.komisi || "0%"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="yellow" dot size="sm">{item.status || "Synced"}</Badge>
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

      {/* TAB 4: STOCK OPNAME */}
      {activeTab === "opname" && (
        loadingOpname ? (
          <SkeletonTable rows={5} columns={8} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Hasil Audit Stock Opname Fisik" : "Physical Stock Opname & Audit"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Atribut: SKU, system stock, physical stock, difference, adjustment"
                    : "Attributes: SKU, system stock, physical stock, difference, adjustment"}
                </CardDescription>
              </div>
              <Badge variant="neutral">{stockOpname.length} Sesi Audit</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {stockOpname.length === 0 ? (
                <EmptyState
                  icon={Icons.AuditClipboard}
                  title="Belum Ada Hasil Stock Opname"
                  description="Koleksi stock_opname masih kosong. Lakukan audit fisik berkala untuk mencocokkan stok aktual."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead className="text-right">System Stock</TableHead>
                      <TableHead className="text-right">Physical Stock</TableHead>
                      <TableHead className="text-right">Difference (Selisih)</TableHead>
                      <TableHead>Penyesuaian / Adjustment</TableHead>
                      <TableHead>Auditor</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockOpname.map((item) => (
                      <TableRow key={item.sku || item.id}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.namaProduk}
                        </TableCell>
                        <TableCell className="text-right font-mono text-text-secondary">
                          {item.systemStock} pcs
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-black-primary">
                          {item.physicalStock} pcs
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          <span className={item.difference < 0 ? "text-accent-red" : item.difference > 0 ? "text-accent-yellow-hover" : "text-text-muted"}>
                            {item.difference > 0 ? `+${item.difference}` : item.difference} pcs
                          </span>
                        </TableCell>
                        <TableCell className="text-text-secondary max-w-xs">{item.adjustment || "-"}</TableCell>
                        <TableCell className="font-mono text-[11px] text-text-muted">{item.auditor || "Staf Gudang"}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={item.difference === 0 ? "yellow" : "neutral"}
                            size="sm"
                          >
                            {item.status || "Audited"}
                          </Badge>
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

      {/* TAB 5: STOK MINIMUM */}
      {activeTab === "minimum" && (
        loadingStok ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{lang === "id" ? "Batas Minimum Stok & Reorder Point" : "Minimum Stock & Reorder Triggers"}</CardTitle>
                <CardDescription>
                  {lang === "id"
                    ? "Daftar barang dengan ketersediaan di bawah batas minimum keamanan gudang"
                    : "Items with inventory levels below the safety buffer threshold"}
                </CardDescription>
              </div>
              <Badge variant={stokMinimumList.length > 0 ? "red" : "neutral"} dot={stokMinimumList.length > 0} size="sm">
                {stokMinimumList.length} Item Menipis
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {stokMinimumList.length === 0 ? (
                <EmptyState
                  icon={Icons.ShieldCheck}
                  title="Semua Stok dalam Kondisi Aman"
                  description="Tidak ada SKU yang berada di bawah ambang batas stok minimum saat ini."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU / Kode</TableHead>
                      <TableHead>Nama Item</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Minimum Stock Buffer</TableHead>
                      <TableHead>Rekomendasi Tindakan Reorder</TableHead>
                      <TableHead className="text-right">Status Buffer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stokMinimumList.map((item) => (
                      <TableRow key={item.sku}>
                        <TableCell className="font-mono font-bold text-black-primary">
                          {item.sku}
                        </TableCell>
                        <TableCell className="font-semibold text-black-primary">
                          {item.namaProduk}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          <span className={item.currentStock < item.minimumStock ? "text-accent-red font-black" : "text-black-primary"}>
                            {item.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-text-secondary">
                          {item.minimumStock}
                        </TableCell>
                        <TableCell className="text-text-secondary">{item.reorderPoint}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={item.priority === "high" ? "red" : "yellow"}
                            dot={item.priority === "high"}
                            size="sm"
                          >
                            {item.status}
                          </Badge>
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

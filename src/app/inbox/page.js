import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "../../components/ui";

export const metadata = {
  title: "Kotak Masuk | CHORAL.ID Inventory",
  description: "Operational notifications, critical buffer alerts, and material purchase requests.",
};

export default function InboxPage() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Kotak Masuk &amp; Notifikasi Sistem</CardTitle>
          <CardDescription>
            Peringatan operasional gudang, approval mutasi material, dan update status sinkronisasi marketplace.
          </CardDescription>
        </div>
        <Badge variant="red" dot size="sm">2 Pesan Baru</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3.5 rounded-lg bg-accent-red-surface/40 border border-accent-red-border/60 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent-red">Peringatan Kritis: Buffer Stok SKU Menipis</span>
            <span className="text-[10px] font-mono text-text-muted">10 menit lalu</span>
          </div>
          <span className="text-text-secondary mt-1 block">
            SKU CHR-BP-EVO-BLK tersisa 8 unit di Gudang Pusat (di bawah batas minimum 25 unit). Segera buat SPK Produksi baru.
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-surface-muted border border-border-subtle text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-black-primary">Penerimaan Supplier Diterima Lengkap</span>
            <span className="text-[10px] font-mono text-text-muted">1 jam lalu</span>
          </div>
          <span className="text-text-secondary mt-1 block">
            450 Meter Cordura Fabric 1000D telah diverifikasi oleh petugas QC dan masuk ke rak Area B1.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

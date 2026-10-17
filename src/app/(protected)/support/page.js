import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";

export const metadata = {
  title: "Pusat Bantuan | CHORAL.ID Inventory",
  description: "Technical support for warehouse barcode scanners, label printers, and marketplace API sync.",
};

export default function SupportPage() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Pusat Bantuan &amp; Helpdesk Operasional</CardTitle>
          <CardDescription>
            Bantuan teknis aplikasi inventaris, troubleshooting barcode scanner Zebra/Honeywell, dan printer thermal resi.
          </CardDescription>
        </div>
        <Badge variant="neutral">24/7 Ops Support</Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-xs text-text-secondary">
        <p>
          Jika Anda mengalami kendala sinkronisasi stok marketplace, diskrepansi webhook, atau masalah cetak label resi kurir, silakan hubungi tim DevOps &amp; Inventory Ops CHORAL.ID:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle">
            <span className="font-bold text-black-primary block text-sm">Helpdesk Internal</span>
            <span className="text-text-secondary block mt-1">Extension: #402 (Divisi IT Gudang)</span>
            <span className="font-mono text-accent-yellow-hover font-semibold block mt-0.5">tech-ops@choral.id</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle">
            <span className="font-bold text-black-primary block text-sm">Escalation On-Call</span>
            <span className="text-text-secondary block mt-1">Koordinator Pergudangan: Budi Santoso</span>
            <span className="font-mono text-text-primary font-semibold block mt-0.5">+62 812-9988-7766</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

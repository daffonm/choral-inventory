import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "../../components/ui";

export const metadata = {
  title: "Dokumentasi SOP | CHORAL.ID Inventory",
  description: "Standard Operating Procedures (SOP) for warehouse operations and quality control.",
};

export default function DocumentationPage() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Dokumentasi &amp; SOP Pergudangan</CardTitle>
          <CardDescription>
            Standar Operasional Prosedur (SOP) pergudangan, toleransi QC jahit, dan panduan API integrasi marketplace CHORAL.ID.
          </CardDescription>
        </div>
        <Badge variant="yellow">SOP v2.4</Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-xs text-text-secondary">
        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle">
          <span className="font-bold text-black-primary block text-sm">1. SOP Penerimaan Bahan Baku Vendor</span>
          <p className="mt-1">
            Setiap roll kain Cordura 1000D wajib diuji fisik ketebalan PU coating dan kesesuaian lot celup sebelum disimpan di Rack B Gudang Pusat.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle">
          <span className="font-bold text-black-primary block text-sm">2. SOP Quality Control Jahit Semi-Mfg</span>
          <p className="mt-1">
            Uji buka-tutup zipper YKK Aquaguard minimal 5x per sampel. Jahitan bar-tack penguat webbing tali strap wajib berada pada toleransi &plusmn;2mm.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-surface-muted/60 border border-border-subtle">
          <span className="font-bold text-black-primary block text-sm">3. SOP Fulfillment &amp; SLA Ekspedisi</span>
          <p className="mt-1">
            Pesanan marketplace (Shopee / TikTok Shop) yang berstatus <em>Waiting Fulfillment</em> sebelum pukul 15.00 WIB wajib diserahkan ke drop point kurir di hari yang sama.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "../../components/ui";

export const metadata = {
  title: "Ajak Mitra | CHORAL.ID Inventory",
  description: "Partnership program for streetwear distro retail partners and consignment stores.",
};

export default function ReferPartnerPage() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Program Kemitraan &amp; Reseller CHORAL</CardTitle>
          <CardDescription>
            Ajak toko distro, concept store, dan mitra reseller streetwear untuk bergabung dalam jaringan distribusi resmi CHORAL.ID.
          </CardDescription>
        </div>
        <Badge variant="yellow">B2B Network</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-text-secondary">
        <p>
          Mitra yang mendaftar melalui portal B2B mendapatkan akses alokasi stok eksklusif, batas kredit konsinyasi hingga 30 hari, dan komisi referral berulang.
        </p>
      </CardContent>
    </Card>
  );
}

import { PersediaanView } from "@/components/views";

export const metadata = {
  title: "Stok Saat Ini | CHORAL.ID Inventory",
  description: "Status stok realtime on-hand per SKU dan alokasi gudang.",
};

export default function PersediaanStokSaatIniPage() {
  return <PersediaanView initialTab="stokSaatIni" />;
}

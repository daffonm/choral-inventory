import { BarangMasukView } from "@/components/views";

export const metadata = {
  title: "Hasil Produksi | CHORAL.ID Inbound",
  description: "Serah terima hasil produksi jahit ke gudang dan inspeksi kelayakan QC.",
};

export default function InboundProduksiPage() {
  return <BarangMasukView initialTab="produksi" />;
}

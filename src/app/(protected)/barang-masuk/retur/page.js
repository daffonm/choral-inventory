import BarangMasukView from "@/components/views/BarangMasuk/BarangMasukView";

export const metadata = {
  title: "Barang Retur | CHORAL.ID Inbound",
  description: "Log barang retur pelanggan dan penanganan QC gate.",
};

export default function InboundReturPage() {
  return <BarangMasukView initialTab="retur" />;
}

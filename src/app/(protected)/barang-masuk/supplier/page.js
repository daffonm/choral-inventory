import BarangMasukView from "@/components/views/BarangMasuk/BarangMasukView";

export const metadata = {
  title: "Penerimaan Supplier | CHORAL.ID Inbound",
  description: "Catatan penerimaan bahan baku mentah dari vendor supplier.",
};

export default function InboundSupplierPage() {
  return <BarangMasukView initialTab="supplier" />;
}

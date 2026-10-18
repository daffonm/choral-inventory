import PesananView from "@/components/views/Pesanan/PesananView";

export const metadata = {
  title: "Proses Fulfillment | CHORAL.ID Outbound",
  description: "Alur proses fulfillment 6 tahapan gudang CHORAL.ID.",
};

export default function BarangKeluarFulfillmentPage() {
  return <PesananView initialTab="fulfillment" />;
}

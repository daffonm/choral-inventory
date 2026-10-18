import PesananView from "@/components/views/Pesanan/PesananView";

export const metadata = {
  title: "Riwayat Pesanan | CHORAL.ID Outbound",
  description: "Arsip dan riwayat pesanan selesai pelanggan CHORAL.",
};

export default function PesananRiwayatPage() {
  return <PesananView initialTab="riwayat" />;
}

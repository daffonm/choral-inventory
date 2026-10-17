import { PesananView } from "@/components/views";

export const metadata = {
  title: "Daftar Pesanan | CHORAL.ID Outbound",
  description: "Daftar pesanan aktif dan antrean pemrosesan order marketplace.",
};

export default function BarangKeluarDaftarPage() {
  return <PesananView initialTab="daftar" />;
}

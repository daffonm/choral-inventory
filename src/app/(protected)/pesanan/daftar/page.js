import PesananView from "@/components/views/Pesanan/PesananView";

export const metadata = {
  title: "Daftar Pesanan | CHORAL.ID Outbound",
  description: "Daftar pesanan aktif dan antrean pemrosesan order marketplace.",
};

export default function PesananDaftarPage() {
  return <PesananView initialTab="daftar" />;
}

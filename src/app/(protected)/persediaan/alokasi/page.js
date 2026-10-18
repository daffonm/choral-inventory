import PersediaanView from "@/components/views/Persediaan/PersediaanView";

export const metadata = {
  title: "Alokasi Stok | CHORAL.ID Inventory",
  description: "Alokasi stok multi-channel marketplace dan penjualan offline.",
};

export default function PersediaanAlokasiPage() {
  return <PersediaanView initialTab="alokasi" />;
}

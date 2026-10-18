import PersediaanView from "@/components/views/Persediaan/PersediaanView";

export const metadata = {
  title: "Stok Minimum Buffer | CHORAL.ID Inventory",
  description: "Peringatan batas minimum stok dan rekomendasi reorder trigger gudang.",
};

export default function PersediaanMinimumPage() {
  return <PersediaanView initialTab="minimum" />;
}

import PersediaanView from "@/components/views/Persediaan/PersediaanView";

export const metadata = {
  title: "Pergerakan Stok | CHORAL.ID Inventory",
  description: "Buku mutasi dan pergerakan stok barang masuk dan keluar.",
};

export default function PersediaanPergerakanPage() {
  return <PersediaanView initialTab="pergerakan" />;
}

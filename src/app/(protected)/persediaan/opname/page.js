import PersediaanView from "@/components/views/Persediaan/PersediaanView";

export const metadata = {
  title: "Stock Opname | CHORAL.ID Inventory",
  description: "Hasil audit fisik stock opname dan penyesuaian selisih inventaris.",
};

export default function PersediaanOpnamePage() {
  return <PersediaanView initialTab="opname" />;
}

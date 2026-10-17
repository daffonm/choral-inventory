import { TransaksiView } from "@/components/views";

export const metadata = {
  title: "Barang Keluar | CHORAL.ID Transactions",
  description: "Log pengeluaran barang keluar: Fulfillment, Internal, Damaged, Adjustment.",
};

export default function TransaksiKeluarPage() {
  return <TransaksiView initialTab="keluar" />;
}

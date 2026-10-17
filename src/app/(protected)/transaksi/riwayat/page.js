import { TransaksiView } from "@/components/views";

export const metadata = {
  title: "Riwayat Transaksi | CHORAL.ID Transactions",
  description: "Riwayat transaksi terpadu double-entry audit ledger.",
};

export default function TransaksiRiwayatPage() {
  return <TransaksiView initialTab="riwayat" />;
}

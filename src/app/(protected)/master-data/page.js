import MasterDataView from "@/components/views/MasterData/MasterDataView";

export const metadata = {
  title: "Master Data | CHORAL.ID Inventory",
  description: "Master catalogs for products, raw materials, supplier vendors, warehouses, and distribution channels.",
};

export default function MasterDataPage() {
  return <MasterDataView />;
}

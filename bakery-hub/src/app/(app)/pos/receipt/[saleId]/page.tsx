import { getSaleWithItems } from "../../actions";
import { notFound } from "next/navigation";
import type { Sale, SaleItem, Store } from "@/lib/types";
import ReceiptClient from "./ReceiptClient";

type Props = {
  params: Promise<{ saleId: string }>;
};

export default async function ReceiptPage({ params }: Props) {
  const { saleId } = await params;
  const { sale, items, store } = await getSaleWithItems(saleId);

  if (!sale) {
    notFound();
  }

  return (
    <ReceiptClient
      sale={sale as Sale}
      items={items as SaleItem[]}
      store={store as Store | null}
    />
  );
}

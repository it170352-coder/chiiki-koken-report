"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore } from "@/lib/store";

export type BulkItem = {
  productId: string;
  produced: number;
  sold: number;
  wasted: number;
};

export async function saveAllInventoryLogs(date: string, items: BulkItem[]) {
  const { supabase, userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) return { error: "認証エラー" };

  const rows = items.map((item) => ({
    store_id: storeId,
    user_id: userId,
    product_id: item.productId,
    date,
    produced: Math.max(0, item.produced),
    sold: Math.max(0, item.sold),
    wasted: Math.max(0, item.wasted),
  }));

  const { error } = await supabase
    .from("inventory_logs")
    .upsert(rows, { onConflict: "store_id,product_id,date" });

  if (error) return { error: error.message };

  revalidatePath("/inventory");
  revalidatePath("/");
  return { error: null };
}

export async function saveInventoryLog(formData: FormData) {
  const { supabase, userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) return;

  const productId = String(formData.get("product_id") ?? "");
  const date = String(formData.get("date") ?? "");
  if (!productId || !date) return;

  const produced = Math.max(0, Number(formData.get("produced") ?? 0) || 0);
  const sold = Math.max(0, Number(formData.get("sold") ?? 0) || 0);
  const wasted = Math.max(0, Number(formData.get("wasted") ?? 0) || 0);

  await supabase.from("inventory_logs").upsert(
    {
      store_id: storeId,
      user_id: userId,
      product_id: productId,
      date,
      produced,
      sold,
      wasted,
    },
    { onConflict: "store_id,product_id,date" },
  );

  revalidatePath("/inventory");
  revalidatePath("/");
}

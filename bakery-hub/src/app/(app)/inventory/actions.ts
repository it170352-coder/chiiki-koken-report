"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore } from "@/lib/store";

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

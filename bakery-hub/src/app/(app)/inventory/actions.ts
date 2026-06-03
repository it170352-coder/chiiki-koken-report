"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id };
}

export async function saveInventoryLog(formData: FormData) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  const productId = String(formData.get("product_id") ?? "");
  const date = String(formData.get("date") ?? "");
  if (!productId || !date) return;

  const produced = Math.max(0, Number(formData.get("produced") ?? 0) || 0);
  const sold = Math.max(0, Number(formData.get("sold") ?? 0) || 0);
  const wasted = Math.max(0, Number(formData.get("wasted") ?? 0) || 0);

  await supabase.from("inventory_logs").upsert(
    {
      user_id: userId,
      product_id: productId,
      date,
      produced,
      sold,
      wasted,
    },
    { onConflict: "user_id,product_id,date" },
  );

  revalidatePath("/inventory");
  revalidatePath("/");
}

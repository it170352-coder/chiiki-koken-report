"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore } from "@/lib/store";

export async function createProduct(formData: FormData) {
  const { supabase, userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase.from("products").insert({
    store_id: storeId,
    user_id: userId,
    name,
    category: String(formData.get("category") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    is_active: true,
  });

  revalidatePath("/products");
}

export async function toggleProduct(id: string, isActive: boolean) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("store_id", storeId);

  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase.from("products").delete().eq("id", id).eq("store_id", storeId);
  revalidatePath("/products");
}

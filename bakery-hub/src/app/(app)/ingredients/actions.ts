"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore } from "@/lib/store";

export async function upsertIngredient(formData: FormData): Promise<void> {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  const id = formData.get("id") as string | null;
  const category = String(formData.get("category") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const minimum_stock = Math.max(0, Number(formData.get("minimum_stock") ?? 0) || 0);
  const purchase_price = Math.max(0, Number(formData.get("purchase_price") ?? 0) || 0);
  const supplier = (formData.get("supplier") as string | null)?.trim() || null;

  if (!category || !name || !unit) return;

  if (id) {
    await supabase
      .from("ingredients")
      .update({ category, name, unit, minimum_stock, purchase_price, supplier, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("store_id", storeId);
  } else {
    await supabase.from("ingredients").insert({
      store_id: storeId,
      category,
      name,
      unit,
      stock_quantity: 0,
      minimum_stock,
      purchase_price,
      supplier,
    });
  }

  revalidatePath("/ingredients");
  revalidatePath("/");
}

export async function updateStock(id: string, stock_quantity: number) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase
    .from("ingredients")
    .update({ stock_quantity, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("store_id", storeId);

  revalidatePath("/ingredients");
  revalidatePath("/");
}

export async function deleteIngredient(id: string) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase.from("ingredients").delete().eq("id", id).eq("store_id", storeId);

  revalidatePath("/ingredients");
  revalidatePath("/");
}

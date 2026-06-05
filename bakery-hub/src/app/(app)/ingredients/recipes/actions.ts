"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore } from "@/lib/store";

export async function upsertRecipeItem(formData: FormData): Promise<void> {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  const product_id = String(formData.get("product_id") ?? "").trim();
  const ingredient_id = String(formData.get("ingredient_id") ?? "").trim();
  const usage_quantity = Math.max(0, parseFloat(String(formData.get("usage_quantity") ?? "0")) || 0);
  const unit = String(formData.get("unit") ?? "").trim();

  if (!product_id || !ingredient_id || !unit || usage_quantity <= 0) return;

  // 同じ商品・原材料の組み合わせがあれば更新、なければ追加
  const { data: existing } = await supabase
    .from("recipe_items")
    .select("id")
    .eq("store_id", storeId)
    .eq("product_id", product_id)
    .eq("ingredient_id", ingredient_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("recipe_items")
      .update({ usage_quantity, unit })
      .eq("id", existing.id);
  } else {
    await supabase.from("recipe_items").insert({
      store_id: storeId,
      product_id,
      ingredient_id,
      usage_quantity,
      unit,
    });
  }

  revalidatePath("/ingredients/recipes");
  revalidatePath("/");
}

export async function deleteRecipeItem(id: string) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase.from("recipe_items").delete().eq("id", id).eq("store_id", storeId);

  revalidatePath("/ingredients/recipes");
  revalidatePath("/");
}

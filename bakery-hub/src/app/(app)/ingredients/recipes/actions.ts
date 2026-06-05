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

export type TemplateItem = { ingredientName: string; usageQuantity: number; unit: string };

export async function applyRecipeTemplate(productId: string, items: TemplateItem[]) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return { error: "認証エラー" };

  // 原材料名からIDを引く
  const names = items.map((i) => i.ingredientName);
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name")
    .eq("store_id", storeId)
    .in("name", names);

  if (!ingredients || ingredients.length === 0) return { error: "原材料が登録されていません" };

  const nameToId = new Map(ingredients.map((i: { id: string; name: string }) => [i.name, i.id]));

  const rows = items
    .filter((item) => nameToId.has(item.ingredientName))
    .map((item) => ({
      store_id: storeId,
      product_id: productId,
      ingredient_id: nameToId.get(item.ingredientName)!,
      usage_quantity: item.usageQuantity,
      unit: item.unit,
    }));

  if (rows.length === 0) return { error: "マッチする原材料が見つかりませんでした" };

  await supabase
    .from("recipe_items")
    .upsert(rows, { onConflict: "store_id,product_id,ingredient_id", ignoreDuplicates: false });

  revalidatePath("/ingredients/recipes");
  revalidatePath("/");
  return { error: null, added: rows.length };
}

export async function deleteRecipeItem(id: string) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase.from("recipe_items").delete().eq("id", id).eq("store_id", storeId);

  revalidatePath("/ingredients/recipes");
  revalidatePath("/");
}

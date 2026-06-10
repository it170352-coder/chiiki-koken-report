"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore } from "@/lib/store";

type ImportResult = { imported: number; errors: string[] };

// 商品CSV: 商品名,カテゴリ,価格
export async function importProducts(rows: { name: string; category: string; price: number }[]): Promise<ImportResult> {
  const { supabase, userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) return { imported: 0, errors: ["認証エラー"] };

  const errors: string[] = [];
  let imported = 0;

  for (const row of rows) {
    if (!row.name) { errors.push(`商品名が空の行をスキップ`); continue; }
    const { error } = await supabase.from("products").insert({
      store_id: storeId,
      user_id: userId,
      name: row.name,
      category: row.category ?? "",
      price: row.price ?? 0,
      is_active: true,
    });
    if (error) errors.push(`「${row.name}」: ${error.message}`);
    else imported++;
  }

  revalidatePath("/products");
  return { imported, errors };
}

// 在庫CSV: 商品名,製造数,販売数,廃棄数
export async function importInventory(
  rows: { name: string; produced: number; sold: number; wasted: number }[],
  date: string
): Promise<ImportResult> {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return { imported: 0, errors: ["認証エラー"] };

  const { data: products } = await supabase.from("products").select("id, name").eq("store_id", storeId);
  const nameToId = new Map((products ?? []).map((p: { id: string; name: string }) => [p.name, p.id]));

  const errors: string[] = [];
  let imported = 0;

  for (const row of rows) {
    const productId = nameToId.get(row.name);
    if (!productId) { errors.push(`「${row.name}」は商品に登録されていません`); continue; }
    const { error } = await supabase.from("inventory_logs").upsert({
      product_id: productId,
      date,
      produced: row.produced ?? 0,
      sold: row.sold ?? 0,
      wasted: row.wasted ?? 0,
    }, { onConflict: "product_id,date" });
    if (error) errors.push(`「${row.name}」: ${error.message}`);
    else imported++;
  }

  revalidatePath("/products");
  return { imported, errors };
}

// 原材料CSV: カテゴリ,名前,単位,最低在庫,仕入単価,仕入先
export async function importIngredients(
  rows: { category: string; name: string; unit: string; minimum_stock: number; purchase_price: number; supplier: string }[]
): Promise<ImportResult> {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return { imported: 0, errors: ["認証エラー"] };

  const errors: string[] = [];
  let imported = 0;

  for (const row of rows) {
    if (!row.name || !row.unit) { errors.push(`名前または単位が空の行をスキップ`); continue; }
    const { error } = await supabase.from("ingredients").insert({
      store_id: storeId,
      category: row.category ?? "",
      name: row.name,
      unit: row.unit,
      stock_quantity: 0,
      minimum_stock: row.minimum_stock ?? 0,
      purchase_price: row.purchase_price ?? 0,
      supplier: row.supplier || null,
    });
    if (error) errors.push(`「${row.name}」: ${error.message}`);
    else imported++;
  }

  revalidatePath("/products");
  revalidatePath("/ingredients");
  return { imported, errors };
}

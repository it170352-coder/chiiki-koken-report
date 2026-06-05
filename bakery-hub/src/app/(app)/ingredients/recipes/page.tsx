import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import type { Product, Ingredient, RecipeItem } from "@/lib/types";
import { upsertRecipeItem, deleteRecipeItem } from "./actions";
import Link from "next/link";

// 商品ごとの製造可能数を計算する
function calcProducible(
  recipeItems: RecipeItem[],
  ingredients: Ingredient[],
): number | null {
  if (recipeItems.length === 0) return null;
  const stockMap = new Map(ingredients.map((i) => [i.id, i.stock_quantity]));
  let min = Infinity;
  for (const ri of recipeItems) {
    if (ri.usage_quantity <= 0) continue;
    const stock = stockMap.get(ri.ingredient_id) ?? 0;
    const n = Math.floor(stock / ri.usage_quantity);
    if (n < min) min = n;
  }
  return min === Infinity ? 0 : min;
}

export default async function RecipesPage() {
  const { storeId } = await getCurrentStore();
  const supabase = await createClient();

  const [{ data: products }, { data: ingredients }, { data: recipeItems }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, category")
        .eq("store_id", storeId ?? "")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("ingredients")
        .select("*")
        .eq("store_id", storeId ?? "")
        .order("category")
        .order("name"),
      supabase
        .from("recipe_items")
        .select("*")
        .eq("store_id", storeId ?? ""),
    ]);

  const productList = (products ?? []) as Pick<Product, "id" | "name" | "category">[];
  const ingredientList = (ingredients ?? []) as Ingredient[];
  const recipeList = (recipeItems ?? []) as RecipeItem[];

  // 商品ごとにレシピをグループ化
  const recipeByProduct = new Map<string, RecipeItem[]>();
  for (const ri of recipeList) {
    const arr = recipeByProduct.get(ri.product_id) ?? [];
    arr.push(ri);
    recipeByProduct.set(ri.product_id, arr);
  }

  const ingredientMap = new Map(ingredientList.map((i) => [i.id, i]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bark-900">レシピ管理</h1>
        <Link
          href="/ingredients"
          className="rounded-lg border border-bark-300 px-3 py-2 text-sm font-medium text-bark-700 hover:bg-bark-50"
        >
          原材料一覧
        </Link>
      </div>

      {productList.length === 0 ? (
        <div className="rounded-2xl border border-bark-100 bg-white p-6 text-center text-sm text-gray-400">
          商品が登録されていません。
          <Link href="/products" className="ml-1 text-bark-700 hover:underline">
            商品を登録
          </Link>
          してください。
        </div>
      ) : (
        <div className="space-y-6">
          {productList.map((product) => {
            const items = recipeByProduct.get(product.id) ?? [];
            const producible = calcProducible(items, ingredientList);

            return (
              <div key={product.id} className="rounded-2xl border border-bark-100 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-800">{product.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{product.category}</span>
                  </div>
                  {producible !== null && (
                    <span
                      className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
                        producible === 0
                          ? "bg-red-100 text-red-700"
                          : producible <= 10
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      製造可能: {producible} 個
                    </span>
                  )}
                </div>

                {/* 既存レシピ明細 */}
                {items.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {items.map((ri) => {
                      const ing = ingredientMap.get(ri.ingredient_id);
                      return (
                        <div
                          key={ri.id}
                          className="flex items-center justify-between rounded-lg bg-bark-50 px-3 py-2 text-sm"
                        >
                          <span className="text-gray-700">
                            {ing?.name ?? "（削除済み原材料）"} — {ri.usage_quantity} {ri.unit} / 個
                          </span>
                          <form
                            action={async () => {
                              "use server";
                              await deleteRecipeItem(ri.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="text-xs text-red-400 hover:text-red-600"
                            >
                              削除
                            </button>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 原材料追加フォーム */}
                {ingredientList.length > 0 && (
                  <form action={upsertRecipeItem} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="product_id" value={product.id} />
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">原材料</label>
                      <select
                        name="ingredient_id"
                        required
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
                      >
                        <option value="">選択</option>
                        {ingredientList.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}（{ing.unit}）
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">1個あたりの使用量</label>
                      <input
                        type="number"
                        name="usage_quantity"
                        required
                        min={0}
                        step="any"
                        placeholder="0.2"
                        className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">単位</label>
                      <input
                        type="text"
                        name="unit"
                        required
                        placeholder="kg"
                        className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-lg bg-bark-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-bark-700"
                    >
                      追加
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

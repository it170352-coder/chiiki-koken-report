import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import type { Ingredient } from "@/lib/types";
import { INGREDIENT_CATEGORIES } from "@/lib/types";
import { upsertIngredient } from "./actions";
import IngredientRow from "./IngredientRow";
import Link from "next/link";

export default async function IngredientsPage() {
  const { storeId } = await getCurrentStore();
  const supabase = await createClient();

  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("*")
    .eq("store_id", storeId ?? "")
    .order("category")
    .order("name");

  const list = (ingredients ?? []) as Ingredient[];

  // カテゴリ別グループ化
  const groups = new Map<string, Ingredient[]>();
  for (const item of list) {
    const arr = groups.get(item.category) ?? [];
    arr.push(item);
    groups.set(item.category, arr);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bark-900">原材料管理</h1>
        <Link
          href="/ingredients/recipes"
          className="rounded-lg border border-bark-300 px-3 py-2 text-sm font-medium text-bark-700 hover:bg-bark-50"
        >
          レシピ管理
        </Link>
      </div>

      {/* 新規追加フォーム */}
      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">原材料を追加</h2>
        <form action={upsertIngredient} className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">カテゴリ</label>
              <select
                name="category"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
              >
                <option value="">選択してください</option>
                {INGREDIENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">名前</label>
              <input
                type="text"
                name="name"
                required
                placeholder="強力粉"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">単位</label>
              <input
                type="text"
                name="unit"
                required
                placeholder="kg"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">最低在庫</label>
              <input
                type="number"
                name="minimum_stock"
                min={0}
                step="any"
                defaultValue={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">仕入単価</label>
              <input
                type="number"
                name="purchase_price"
                min={0}
                step="any"
                defaultValue={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">仕入先（任意）</label>
              <input
                type="text"
                name="supplier"
                placeholder="〇〇商店"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700"
          >
            追加
          </button>
        </form>
      </div>

      {/* 一覧 */}
      {groups.size === 0 ? (
        <div className="rounded-2xl border border-bark-100 bg-white p-6 text-center text-sm text-gray-400">
          原材料が登録されていません。上のフォームから追加してください。
        </div>
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-2 text-sm font-semibold text-gray-500">{category}</h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <IngredientRow key={item.id} ingredient={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

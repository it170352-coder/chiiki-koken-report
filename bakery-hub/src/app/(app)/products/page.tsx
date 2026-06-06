import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { PRODUCT_CATEGORIES } from "@/lib/types";
import { createProduct } from "./actions";
import ProductRow from "./ProductRow";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (products ?? []) as Product[];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-bark-900">商品管理</h1>

      <form
        action={createProduct}
        className="grid gap-3 rounded-2xl border border-bark-100 bg-white p-5 sm:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <input
          name="name"
          required
          placeholder="商品名（例：クロワッサン）"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
        />
        <select
          name="category"
          defaultValue=""
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-bark-500 focus:outline-none"
        >
          <option value="">カテゴリを選択</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          min="0"
          placeholder="価格（円）"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
        />
        <button className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700">
          追加
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-bark-100 bg-white">
        {list.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">
            まだ商品が登録されていません。上のフォームから追加してください。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="border-b border-bark-100 bg-bark-50/50 text-left text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2 font-medium">商品名</th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium">カテゴリ</th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium">価格</th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium">状態</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <ProductRow key={p.id} product={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

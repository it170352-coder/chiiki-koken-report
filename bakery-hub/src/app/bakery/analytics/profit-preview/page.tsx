import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function ProfitPreviewPage(props: PageProps<"/bakery/analytics/profit-preview">) {
  const sp = await props.searchParams;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 6);

  const from = typeof sp.from === "string" && sp.from ? sp.from : fmtDate(defaultFrom);
  const to = typeof sp.to === "string" && sp.to ? sp.to : fmtDate(today);

  const { storeId } = await getCurrentStore();
  const supabase = await createClient();

  const [
    { data: products },
    { data: recipeItems },
    { data: ingredients },
    { data: logs },
  ] = await Promise.all([
    supabase.from("products").select("id, name, price, category").eq("store_id", storeId ?? ""),
    supabase.from("recipe_items").select("product_id, ingredient_id, usage_quantity"),
    supabase.from("ingredients").select("id, purchase_price, unit"),
    supabase
      .from("inventory_logs")
      .select("product_id, sold")
      .gte("date", from)
      .lte("date", to),
  ]);

  // 原価マップ: product_id → unitCost
  const ingredientMap = new Map<string, { price: number; unit: string }>(
    (ingredients ?? []).map((i: { id: string; purchase_price: number; unit: string }) => [
      i.id,
      { price: i.purchase_price ?? 0, unit: i.unit },
    ])
  );

  // recipe_items grouping
  const recipeMap = new Map<string, { ingredient_id: string; usage_quantity: number }[]>();
  for (const r of (recipeItems ?? []) as { product_id: string; ingredient_id: string; usage_quantity: number }[]) {
    const arr = recipeMap.get(r.product_id) ?? [];
    arr.push(r);
    recipeMap.set(r.product_id, arr);
  }

  // sold quantity per product in date range
  const soldMap = new Map<string, number>();
  for (const l of (logs ?? []) as { product_id: string; sold: number }[]) {
    soldMap.set(l.product_id, (soldMap.get(l.product_id) ?? 0) + l.sold);
  }

  const items = ((products ?? []) as { id: string; name: string; price: number; category: string }[])
    .map((p) => {
      const recipe = recipeMap.get(p.id);
      const hasRecipe = recipe && recipe.length > 0;
      const unitCost = hasRecipe
        ? recipe!.reduce((sum, r) => {
            const ing = ingredientMap.get(r.ingredient_id);
            return sum + (ing?.price ?? 0) * r.usage_quantity;
          }, 0)
        : null;
      const sold = soldMap.get(p.id) ?? 0;
      const revenue = sold * p.price;
      const costTotal = unitCost !== null ? unitCost * sold : null;
      const profit = costTotal !== null ? revenue - costTotal : null;
      const margin = revenue > 0 && profit !== null ? (profit / revenue) * 100 : null;
      return { id: p.id, name: p.name, price: p.price, sold, unitCost, revenue, costTotal, profit, margin, hasRecipe };
    })
    .filter((p) => p.sold > 0 || p.hasRecipe)
    .sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);
  const totalCost = items.reduce((s, i) => s + (i.costTotal ?? 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "—";

  const lowMarginItems = items.filter((i) => i.margin !== null && i.margin < 50);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-bark-900">原価・利益分析</h1>
        <form method="get" className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-lg border border-gray-300 px-3 py-1.5 focus:border-bark-500 focus:outline-none"
          />
          <span className="text-gray-400">〜</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-lg border border-gray-300 px-3 py-1.5 focus:border-bark-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg border border-bark-300 px-3 py-1.5 font-medium text-bark-700 hover:bg-bark-50"
          >
            表示
          </button>
        </form>
      </div>

      <p className="text-xs text-gray-400">
        ※原価はレシピの「原材料 × 使用量 × 仕入単価」で算出します。レシピ未設定の商品は原価を計算できません。
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">期間の売上合計</p>
          <p className="mt-1 text-xl font-bold text-bark-900">¥{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">原価合計</p>
          <p className="mt-1 text-xl font-bold text-red-500">¥{totalCost.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">粗利益</p>
          <p className="mt-1 text-xl font-bold text-green-600">¥{totalProfit.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-bark-100 bg-white p-4">
          <p className="text-xs text-gray-500">平均利益率</p>
          <p className="mt-1 text-xl font-bold text-bark-700">{totalMargin}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">商品別 原価・利益</h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">この期間の販売データがありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-bark-100 text-xs text-gray-400">
                  <th className="pb-2 text-left">商品名</th>
                  <th className="pb-2 text-right">販売数</th>
                  <th className="pb-2 text-right">売価</th>
                  <th className="pb-2 text-right">原価/個</th>
                  <th className="pb-2 text-right">売上</th>
                  <th className="pb-2 text-right">原価計</th>
                  <th className="pb-2 text-right">粗利</th>
                  <th className="pb-2 text-right">利益率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bark-50">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-gray-800">
                      {item.name}
                      {!item.hasRecipe && (
                        <span className="ml-2 text-xs text-gray-400">レシピ未設定</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-600">{item.sold}個</td>
                    <td className="py-3 text-right text-gray-600">¥{item.price}</td>
                    <td className="py-3 text-right text-gray-600">
                      {item.unitCost !== null ? `¥${Math.round(item.unitCost).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 text-right text-gray-700">¥{item.revenue.toLocaleString()}</td>
                    <td className="py-3 text-right text-red-400">
                      {item.costTotal !== null ? `¥${Math.round(item.costTotal).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 text-right font-medium text-green-600">
                      {item.profit !== null ? `¥${Math.round(item.profit).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 text-right">
                      {item.margin !== null ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.margin >= 60
                            ? "bg-green-100 text-green-700"
                            : item.margin >= 40
                            ? "bg-bark-100 text-bark-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {item.margin.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-bark-200 font-semibold">
                  <td className="pt-3 text-gray-800">合計</td>
                  <td /><td /><td />
                  <td className="pt-3 text-right text-gray-800">¥{totalRevenue.toLocaleString()}</td>
                  <td className="pt-3 text-right text-red-500">¥{totalCost.toLocaleString()}</td>
                  <td className="pt-3 text-right text-green-600">¥{totalProfit.toLocaleString()}</td>
                  <td className="pt-3 text-right text-bark-700">{totalMargin}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {items.some((i) => i.margin !== null) && (
        <div className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-700">利益率ランキング</h2>
          <div className="space-y-3">
            {[...items]
              .filter((i) => i.margin !== null)
              .sort((a, b) => b.margin! - a.margin!)
              .map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-bark-400">{i + 1}</span>
                  <span className="min-w-0 flex-[0_0_7rem] truncate text-sm text-gray-700">{item.name}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-bark-100">
                    <div
                      className="h-2 rounded-full bg-bark-400"
                      style={{ width: `${Math.min(100, item.margin!)}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-sm font-medium text-bark-700">{item.margin!.toFixed(1)}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {lowMarginItems.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">利益率が低い商品（50%未満）</p>
          <ul className="mt-2 space-y-1">
            {lowMarginItems.map((i) => (
              <li key={i.id} className="text-sm text-red-600">
                {i.name}（{i.margin!.toFixed(1)}%）— 仕入単価の見直しまたは販売価格の調整を検討してください。
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

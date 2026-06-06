import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product, Ingredient, RecipeItem } from "@/lib/types";
import { getIngredientStatus } from "@/lib/types";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function todayRange() {
  const jst = new Date(Date.now() + JST_OFFSET_MS);
  const start = new Date(
    Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()) -
      JST_OFFSET_MS,
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function todayDateStr() {
  const jst = new Date(Date.now() + JST_OFFSET_MS);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayLabel() {
  const jst = new Date(Date.now() + JST_OFFSET_MS);
  const m = jst.getUTCMonth() + 1;
  const d = jst.getUTCDate();
  const week = ["日", "月", "火", "水", "木", "金", "土"][jst.getUTCDay()];
  return `${m}/${d}（${week}）`;
}

// KPI カード（Cooladata スタイル）
function KpiCard({
  label,
  value,
  unit,
  icon,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  href?: string;
  accent?: "green" | "red" | "yellow" | "blue" | "bark";
}) {
  const accentMap = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    yellow: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    bark: "bg-bark-100 text-bark-700",
  };
  const iconBg = accentMap[accent ?? "bark"];
  const card = (
    <div className="flex items-start gap-4 rounded-2xl border border-bark-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-bark-900">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>}
        </p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { start, end } = todayRange();
  const today = todayDateStr();

  const { count: todayReservationCount } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .gte("pickup_at", start)
    .lt("pickup_at", end)
    .neq("status", "cancelled");

  const { data: products } = await supabase.from("products").select("id, name, price");
  const priceMap = new Map<string, { name: string; price: number }>();
  (products as Pick<Product, "id" | "name" | "price">[] | null)?.forEach((p) =>
    priceMap.set(p.id, { name: p.name, price: p.price }),
  );
  const productCount = products?.length ?? 0;

  const { data: logs } = await supabase
    .from("inventory_logs")
    .select("product_id, produced, sold, wasted")
    .eq("date", today);

  let todaySales = 0;
  let todayWasted = 0;
  logs?.forEach((l) => {
    const p = priceMap.get(l.product_id);
    if (p) todaySales += l.sold * p.price;
    todayWasted += l.wasted;
  });

  const popularity = new Map<string, number>();
  logs?.forEach((l) => {
    if (l.sold > 0) popularity.set(l.product_id, (popularity.get(l.product_id) ?? 0) + l.sold);
  });
  const ranking = [...popularity.entries()]
    .map(([id, qty]) => ({ name: priceMap.get(id)?.name ?? "（削除商品）", qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const stock = (logs ?? [])
    .map((l) => ({
      name: priceMap.get(l.product_id)?.name ?? "（削除商品）",
      remaining: l.produced - l.sold - l.wasted,
    }))
    .sort((a, b) => a.remaining - b.remaining);

  const { data: visitorsData } = await supabase
    .from("hourly_visitors")
    .select("visitor_count")
    .eq("date", today);
  const todayVisitors = (visitorsData ?? []).reduce(
    (sum, r) => sum + ((r.visitor_count as number) ?? 0),
    0,
  );

  const { count: customerCount } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true });

  const { data: ingredientsData } = await supabase.from("ingredients").select("*");
  const ingredientList = (ingredientsData ?? []) as Ingredient[];
  const alertIngredients = ingredientList.filter((i) => getIngredientStatus(i) === "order");
  const cautionIngredients = ingredientList.filter((i) => getIngredientStatus(i) === "caution");

  const { data: recipeItemsData } = await supabase.from("recipe_items").select("*");
  const recipeList = (recipeItemsData ?? []) as RecipeItem[];
  const ingredientStockMap = new Map(ingredientList.map((i) => [i.id, i.stock_quantity]));
  const recipeByProduct = new Map<string, RecipeItem[]>();
  for (const ri of recipeList) {
    const arr = recipeByProduct.get(ri.product_id) ?? [];
    arr.push(ri);
    recipeByProduct.set(ri.product_id, arr);
  }
  const producibleList: { name: string; count: number }[] = [];
  for (const [productId, items] of recipeByProduct.entries()) {
    if (items.length === 0) continue;
    let min = Infinity;
    for (const ri of items) {
      if (ri.usage_quantity <= 0) continue;
      const s = ingredientStockMap.get(ri.ingredient_id) ?? 0;
      const n = Math.floor(s / ri.usage_quantity);
      if (n < min) min = n;
    }
    const count = min === Infinity ? 0 : min;
    producibleList.push({ name: priceMap.get(productId)?.name ?? "（不明）", count });
  }
  producibleList.sort((a, b) => a.count - b.count);

  const hasAlert = alertIngredients.length > 0;
  const hasCaution = cautionIngredients.length > 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-bark-900">ダッシュボード</h1>
          <p className="mt-0.5 text-sm text-gray-400">{todayLabel()} の営業サマリー</p>
        </div>
        {productCount > 0 && (
          <Link
            href="/inventory"
            className="rounded-xl bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700"
          >
            在庫を記録
          </Link>
        )}
      </div>

      {/* 初期セットアップ */}
      {productCount === 0 && (
        <div className="rounded-2xl border border-bark-200 bg-bark-50 p-5">
          <h2 className="font-semibold text-bark-900">はじめに（かんたん3ステップ）</h2>
          <ol className="mt-3 space-y-2 text-sm text-bark-900">
            <li>
              <span className="mr-2 font-bold text-bark-600">1</span>
              <Link href="/products" className="font-medium underline hover:no-underline">商品を登録</Link>（パンの名前と値段）
            </li>
            <li>
              <span className="mr-2 font-bold text-bark-600">2</span>
              <Link href="/inventory" className="font-medium underline hover:no-underline">在庫を記録</Link>（製造・販売・廃棄）
            </li>
            <li>
              <span className="mr-2 font-bold text-bark-600">3</span>
              <Link href="/reservations/new" className="font-medium underline hover:no-underline">予約を登録</Link>（取り置きの受付）
            </li>
          </ol>
        </div>
      )}

      {/* アラートバナー（MarketMan スタイル） */}
      {(hasAlert || hasCaution) && (
        <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${hasAlert ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
          <span className="mt-0.5 text-lg">{hasAlert ? "🚨" : "⚠️"}</span>
          <div className="flex-1 text-sm">
            <p className={`font-semibold ${hasAlert ? "text-red-700" : "text-amber-700"}`}>
              原材料の在庫が不足しています
            </p>
            <p className="mt-0.5 text-gray-600">
              {hasAlert && <span className="text-red-600 font-medium">発注推奨 {alertIngredients.length} 件</span>}
              {hasAlert && hasCaution && <span className="mx-2 text-gray-400">·</span>}
              {hasCaution && <span className="text-amber-600 font-medium">注意 {cautionIngredients.length} 件</span>}
            </p>
          </div>
          <Link href="/ingredients" className="flex-shrink-0 text-sm font-medium text-bark-700 hover:underline">
            確認する →
          </Link>
        </div>
      )}

      {/* KPI カード群（Cooladata スタイル） */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="本日の売上"
          value={`¥${todaySales.toLocaleString()}`}
          icon="💰"
          href="/inventory"
          accent="green"
        />
        <KpiCard
          label="本日の来客数"
          value={todayVisitors}
          unit="人"
          icon="👥"
          href="/visitors"
          accent="blue"
        />
        <KpiCard
          label="本日の予約"
          value={todayReservationCount ?? 0}
          unit="件"
          icon="📋"
          href="/reservations"
          accent="bark"
        />
        <KpiCard
          label="本日の廃棄数"
          value={todayWasted}
          unit="個"
          icon="🗑️"
          accent={todayWasted > 0 ? "yellow" : "bark"}
        />
      </div>

      {/* 2カラム: ランキング + 在庫状況 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 人気商品ランキング */}
        <div className="rounded-2xl border border-bark-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">販売ランキング</h2>
            <span className="text-xs text-gray-400">本日</span>
          </div>
          {ranking.length === 0 ? (
            <p className="text-sm text-gray-400">本日の販売データがありません。</p>
          ) : (
            <ol className="space-y-3">
              {ranking.map((r, i) => {
                const maxQty = ranking[0]?.qty ?? 1;
                const pct = Math.round((r.qty / maxQty) * 100);
                return (
                  <li key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-gray-700">
                        <span className={`w-5 text-center text-xs font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-400"}`}>
                          {i + 1}
                        </span>
                        {r.name}
                      </span>
                      <span className="font-semibold text-bark-700">{r.qty} 個</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-bark-100">
                      <div
                        className="h-1.5 rounded-full bg-bark-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* 在庫状況 */}
        <div className="rounded-2xl border border-bark-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">在庫状況</h2>
            <Link href="/inventory" className="text-xs font-medium text-bark-600 hover:underline">
              記録する →
            </Link>
          </div>
          {stock.length === 0 ? (
            <p className="text-sm text-gray-400">
              本日の在庫記録がありません。
            </p>
          ) : (
            <ul className="space-y-2.5">
              {stock.slice(0, 6).map((s, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.name}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      s.remaining <= 0
                        ? "bg-red-100 text-red-700"
                        : s.remaining <= 5
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    残 {s.remaining} 個
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 2カラム: 原材料アラート + 製造可能数 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 原材料アラート詳細 */}
        <Link
          href="/ingredients"
          className="block rounded-2xl border border-bark-100 bg-white p-5 shadow-sm hover:border-bark-300"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">原材料アラート</h2>
            <span className="text-xs font-medium text-bark-600">詳細を見る →</span>
          </div>
          {ingredientList.length === 0 ? (
            <p className="text-sm text-gray-400">原材料が登録されていません。</p>
          ) : alertIngredients.length === 0 && cautionIngredients.length === 0 ? (
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-base">✓</span>
              <p className="text-sm font-medium text-green-700">すべての原材料は正常です</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {[...alertIngredients, ...cautionIngredients].slice(0, 5).map((ing, i) => {
                const status = getIngredientStatus(ing);
                return (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{ing.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        status === "order"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {status === "order" ? "発注推奨" : "注意"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Link>

        {/* 製造可能数 */}
        <div className="rounded-2xl border border-bark-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">製造可能数</h2>
            <Link href="/ingredients/recipes" className="text-xs font-medium text-bark-600 hover:underline">
              レシピを管理 →
            </Link>
          </div>
          {producibleList.length === 0 ? (
            <p className="text-sm text-gray-400">
              レシピが登録されていません。
            </p>
          ) : (
            <ul className="space-y-2.5">
              {producibleList.slice(0, 6).map((p, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.count === 0
                        ? "bg-red-100 text-red-700"
                        : p.count <= 10
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {p.count} 個
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* クイックリンク（MarketMan スタイル） */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "商品管理", href: "/products", icon: "🍞" },
          { label: "来客数入力", href: "/visitors", icon: "📊" },
          { label: "原材料管理", href: "/ingredients", icon: "🌾" },
          { label: "分析", href: "/analytics", icon: "📈" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-bark-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:border-bark-300 hover:bg-bark-50"
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

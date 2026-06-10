import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import SalesLineChart from "./SalesLineChart";
import CategoryLineChart from "./CategoryLineChart";
import DayOfWeekChart from "./DayOfWeekChart";
import HourlyChart from "./HourlyChart";
import SalesCsvButton from "./SalesCsvButton";
import { getCurrentStore, canViewAnalytics } from "@/lib/store";
import { redirect } from "next/navigation";

function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function Kpi({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-bark-100 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-bark-900">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>}
      </p>
    </div>
  );
}

export default async function AnalyticsPage(props: PageProps<"/bakery/analytics">) {
  const sp = await props.searchParams;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 6);

  const from = typeof sp.from === "string" && sp.from ? sp.from : fmtDate(defaultFrom);
  const to = typeof sp.to === "string" && sp.to ? sp.to : fmtDate(today);

  const { storeId, role } = await getCurrentStore();
  if (!canViewAnalytics(role)) redirect("/bakery");
  const supabase = await createClient();
  const [{ data: products }, { data: logs }, { data: visitors }] = await Promise.all([
    supabase.from("products").select("id, name, price, category"),
    supabase
      .from("inventory_logs")
      .select("date, product_id, produced, sold, wasted")
      .gte("date", from)
      .lte("date", to)
      .order("date"),
    supabase
      .from("hourly_visitors")
      .select("date, hour, visitor_count")
      .eq("store_id", storeId ?? "")
      .gte("date", from)
      .lte("date", to),
  ]);

  const priceMap = new Map<string, { name: string; price: number; category: string }>();
  (products as Pick<Product, "id" | "name" | "price" | "category">[] | null)?.forEach((p) =>
    priceMap.set(p.id, { name: p.name, price: p.price, category: p.category }),
  );

  const logList = (logs ?? []) as {
    date: string;
    product_id: string;
    produced: number;
    sold: number;
    wasted: number;
  }[];

  let totalSales = 0;
  let totalSold = 0;
  let totalWasted = 0;
  let totalProduced = 0;

  const byDate = new Map<string, number>();
  const byProduct = new Map<string, { name: string; qty: number; sales: number; wasted: number }>();
  const byCategory = new Map<string, { sales: number; qty: number; wasted: number }>();
  const byCategoryDate = new Map<string, Map<string, number>>();

  for (const l of logList) {
    const info = priceMap.get(l.product_id);
    const price = info?.price ?? 0;
    const sales = l.sold * price;
    totalSales += sales;
    totalSold += l.sold;
    totalWasted += l.wasted;
    totalProduced += l.produced;

    byDate.set(l.date, (byDate.get(l.date) ?? 0) + sales);

    const cur =
      byProduct.get(l.product_id) ??
      { name: info?.name ?? "（削除商品）", qty: 0, sales: 0, wasted: 0 };
    cur.qty += l.sold;
    cur.sales += sales;
    cur.wasted += l.wasted;
    byProduct.set(l.product_id, cur);

    const catName = info?.category?.trim() || "未分類";
    const cat = byCategory.get(catName) ?? { sales: 0, qty: 0, wasted: 0 };
    cat.sales += sales;
    cat.qty += l.sold;
    cat.wasted += l.wasted;
    byCategory.set(catName, cat);

    const cdMap = byCategoryDate.get(catName) ?? new Map<string, number>();
    cdMap.set(l.date, (cdMap.get(l.date) ?? 0) + sales);
    byCategoryDate.set(catName, cdMap);
  }

  const dailySeries = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const allDates = dailySeries.map(([d]) => d);
  const categoryNames = [...byCategory.keys()];
  const categoryChartData = allDates.map((date) => {
    const row: Record<string, string | number> = { date };
    for (const cat of categoryNames) {
      row[cat] = byCategoryDate.get(cat)?.get(date) ?? 0;
    }
    return row;
  });

  // 曜日別集計（平均売上）
  const byDow = new Map<number, { sales: number; count: number }>();
  for (const [date, sales] of byDate) {
    const dow = new Date(`${date}T00:00:00`).getDay();
    const cur = byDow.get(dow) ?? { sales: 0, count: 0 };
    cur.sales += sales;
    cur.count += 1;
    byDow.set(dow, cur);
  }
  const dowData = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    sales: byDow.get(i)?.sales ?? 0,
    count: byDow.get(i)?.count ?? 0,
  }));

  // 時間帯別集計（平均来客数）
  const visitorList = (visitors ?? []) as { date: string; hour: number; visitor_count: number }[];
  const byHour = new Map<number, { total: number; days: Set<string> }>();
  for (const v of visitorList) {
    const cur = byHour.get(v.hour) ?? { total: 0, days: new Set() };
    cur.total += v.visitor_count;
    cur.days.add(v.date);
    byHour.set(v.hour, cur);
  }
  const hourlyData = Array.from({ length: 16 }, (_, i) => {
    const hour = i + 6;
    const d = byHour.get(hour);
    return { hour, avg: d ? d.total / Math.max(1, d.days.size) : 0 };
  });

  const productRanking = [...byProduct.values()].sort((a, b) => b.sales - a.sales);
  const wasteRanking = [...byProduct.values()]
    .filter((p) => p.wasted > 0)
    .sort((a, b) => b.wasted - a.wasted);

  const wasteRate = totalProduced > 0 ? (totalWasted / totalProduced) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-bark-900">販売分析</h1>
        <SalesCsvButton dailySeries={dailySeries.map(([date, sales]) => ({ date, sales }))} productRanking={productRanking} from={from} to={to} />
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
        ※売上は在庫記録の「販売数 × 商品価格」で集計しています。在庫記録のない日は集計に含まれません。
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="期間の売上合計" value={`¥${totalSales.toLocaleString()}`} />
        <Kpi label="販売個数" value={totalSold.toLocaleString()} unit="個" />
        <Kpi label="廃棄個数" value={totalWasted.toLocaleString()} unit="個" />
        <Kpi label="廃棄率" value={wasteRate.toFixed(1)} unit="%" />
      </div>

      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">日別売上推移</h2>
        <SalesLineChart
          data={dailySeries.map(([date, sales]) => ({ date, sales }))}
        />
      </div>

      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">カテゴリ別売上推移</h2>
        <CategoryLineChart data={categoryChartData} categories={categoryNames} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-1 font-semibold text-gray-700">曜日別平均売上</h2>
          <p className="mb-3 text-xs text-gray-400">土日はベージュ色で表示</p>
          <DayOfWeekChart data={dowData} />
        </div>
        <div className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-1 font-semibold text-gray-700">時間帯別平均来客数</h2>
          <p className="mb-3 text-xs text-gray-400">来客数の記録をもとに集計（6〜21時）</p>
          <HourlyChart data={hourlyData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-700">商品別売上ランキング</h2>
          {productRanking.length === 0 ? (
            <p className="text-sm text-gray-400">データがありません。</p>
          ) : (
            <ol className="space-y-2">
              {productRanking.map((p, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    <span className="mr-2 font-bold text-bark-600">{i + 1}</span>
                    {p.name}
                    <span className="ml-2 text-xs text-gray-400">{p.qty}個</span>
                  </span>
                  <span className="font-medium text-gray-600">¥{p.sales.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-700">廃棄の多い商品</h2>
          {wasteRanking.length === 0 ? (
            <p className="text-sm text-gray-400">この期間は廃棄なし</p>
          ) : (
            <ul className="space-y-2">
              {wasteRanking.map((p, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-medium text-red-500">{p.wasted}個</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

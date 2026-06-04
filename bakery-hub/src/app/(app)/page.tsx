import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function todayDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Stat({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-amber-900">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { start, end } = todayRange();
  const today = todayDateStr();

  // 本日の予約数（キャンセル以外）
  const { count: todayReservationCount } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .gte("pickup_at", start)
    .lt("pickup_at", end)
    .neq("status", "cancelled");

  // 商品（価格参照用）
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price");
  const priceMap = new Map<string, { name: string; price: number }>();
  (products as Pick<Product, "id" | "name" | "price">[] | null)?.forEach((p) =>
    priceMap.set(p.id, { name: p.name, price: p.price }),
  );
  const productCount = products?.length ?? 0;

  // 本日の在庫ログ
  const { data: logs } = await supabase
    .from("inventory_logs")
    .select("product_id, produced, sold, wasted")
    .eq("date", today);

  // 本日の売上 = sold × price
  let todaySales = 0;
  logs?.forEach((l) => {
    const p = priceMap.get(l.product_id);
    if (p) todaySales += l.sold * p.price;
  });

  // 人気商品ランキング（本日の販売実績＝在庫記録の販売数の合計）
  const popularity = new Map<string, number>();
  logs?.forEach((l) => {
    if (l.sold > 0) {
      popularity.set(l.product_id, (popularity.get(l.product_id) ?? 0) + l.sold);
    }
  });
  const ranking = [...popularity.entries()]
    .map(([id, qty]) => ({ name: priceMap.get(id)?.name ?? "（削除商品）", qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 在庫状況（残数 = produced - sold - wasted）
  const stock = (logs ?? [])
    .map((l) => ({
      name: priceMap.get(l.product_id)?.name ?? "（削除商品）",
      remaining: l.produced - l.sold - l.wasted,
    }))
    .sort((a, b) => a.remaining - b.remaining);

  // 顧客数
  const { count: customerCount } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-amber-900">ダッシュボード</h1>

      {productCount === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">はじめに（かんたん3ステップ）</h2>
          <ol className="mt-3 space-y-2 text-sm text-amber-900">
            <li>
              <span className="mr-2 font-bold text-amber-600">1</span>
              <Link href="/products" className="font-medium underline hover:no-underline">
                商品を登録
              </Link>
              （パンの名前と値段）
            </li>
            <li>
              <span className="mr-2 font-bold text-amber-600">2</span>
              <Link href="/inventory" className="font-medium underline hover:no-underline">
                在庫を記録
              </Link>
              （その日の製造・販売・廃棄）
            </li>
            <li>
              <span className="mr-2 font-bold text-amber-600">3</span>
              <Link href="/reservations/new" className="font-medium underline hover:no-underline">
                予約を登録
              </Link>
              （取り置きの受付）
            </li>
          </ol>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/inventory"
            className="rounded-2xl bg-amber-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-amber-700"
          >
            在庫を記録
          </Link>
          <Link
            href="/reservations/new"
            className="rounded-2xl bg-amber-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-amber-700"
          >
            新規予約
          </Link>
          <Link
            href="/customers"
            className="rounded-2xl border border-amber-300 bg-white px-4 py-3 text-center text-sm font-semibold text-amber-700 hover:bg-amber-50"
          >
            顧客を見る
          </Link>
          <Link
            href="/products"
            className="rounded-2xl border border-amber-300 bg-white px-4 py-3 text-center text-sm font-semibold text-amber-700 hover:bg-amber-50"
          >
            商品を管理
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="本日の予約数" value={todayReservationCount ?? 0} unit="件" />
        <Stat label="本日の売上" value={`¥${todaySales.toLocaleString()}`} />
        <Stat label="登録顧客数" value={customerCount ?? 0} unit="人" />
        <Stat label="本日の在庫記録" value={logs?.length ?? 0} unit="品" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-700">人気商品ランキング（本日の販売実績）</h2>
          {ranking.length === 0 ? (
            <p className="text-sm text-gray-400">本日の販売データがありません。</p>
          ) : (
            <ol className="space-y-2">
              {ranking.map((r, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    <span className="mr-2 font-bold text-amber-600">{i + 1}</span>
                    {r.name}
                  </span>
                  <span className="font-medium text-gray-500">{r.qty} 個</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-700">在庫状況（本日・残数の少ない順）</h2>
          {stock.length === 0 ? (
            <p className="text-sm text-gray-400">
              本日の在庫記録がありません。
              <Link href="/inventory" className="ml-1 text-amber-700 hover:underline">
                在庫を入力
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {stock.slice(0, 6).map((s, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{s.name}</span>
                  <span
                    className={`font-medium ${
                      s.remaining <= 0 ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    残 {s.remaining}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

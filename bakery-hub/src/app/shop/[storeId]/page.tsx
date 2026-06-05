import { createClient } from "@/lib/supabase/server";
import BookingForm from "./BookingForm";

type StoreInfo = {
  name: string;
  pickup_start: string | null;
  pickup_end: string | null;
  closed_days: string;
  closed_dates: string;
};

type PublicProduct = { id: string; name: string; price: number };

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default async function ShopPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const supabase = await createClient();

  const [{ data: infoRows }, { data: productRows }] = await Promise.all([
    supabase.rpc("public_store_info", { p_store: storeId }),
    supabase.rpc("public_store_products", { p_store: storeId }),
  ]);

  const info = (
    Array.isArray(infoRows) ? infoRows[0] : infoRows
  ) as StoreInfo | undefined;
  const products = (productRows ?? []) as PublicProduct[];

  if (!info) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <div className="rounded-2xl border border-bark-100 bg-white p-6 text-center">
          <p className="text-gray-600">店舗が見つかりませんでした。</p>
          <p className="mt-1 text-sm text-gray-400">
            URLが正しいか、お店にご確認ください。
          </p>
        </div>
      </main>
    );
  }

  const pickupStart = (info.pickup_start ?? "").slice(0, 5);
  const pickupEnd = (info.pickup_end ?? "").slice(0, 5);
  const closedDays = info.closed_days
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const closedDates = info.closed_dates
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingClosed = closedDates
    .filter((d) => d >= todayStr)
    .sort()
    .map((d) => {
      const [, m, day] = d.split("-");
      return `${Number(m)}/${Number(day)}`;
    });
  const closedDayLabels = closedDays
    .map((n) => WEEKDAY_LABELS[Number(n)])
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-lg space-y-5 p-4 sm:p-6">
      <header className="rounded-2xl bg-bark-600 p-6 text-white">
        <p className="text-xs text-bark-100">ネット予約</p>
        <h1 className="mt-1 text-2xl font-bold">{info.name || "店舗"}</h1>
      </header>

      <section className="rounded-2xl border border-bark-100 bg-white p-5 text-sm">
        <h2 className="mb-2 font-semibold text-gray-700">営業のご案内</h2>
        <dl className="space-y-1 text-gray-600">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-gray-400">受取時間</dt>
            <dd>{pickupStart && pickupEnd ? `${pickupStart}〜${pickupEnd}` : "店舗にお問い合わせください"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-gray-400">定休日</dt>
            <dd>{closedDayLabels.length ? `毎週 ${closedDayLabels.join("・")}曜` : "なし"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-gray-400">臨時休業</dt>
            <dd>{upcomingClosed.length ? upcomingClosed.join("・") : "予定なし"}</dd>
          </div>
        </dl>
      </section>

      <BookingForm
        storeId={storeId}
        products={products}
        pickupStart={pickupStart}
        pickupEnd={pickupEnd}
        closedDays={closedDays}
        closedDates={closedDates}
      />
    </main>
  );
}

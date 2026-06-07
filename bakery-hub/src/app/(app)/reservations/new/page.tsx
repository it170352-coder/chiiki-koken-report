import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import type { Customer, Product } from "@/lib/types";
import { createReservation } from "../actions";

export default async function NewReservationPage() {
  const { supabase, storeId } = await getCurrentStore();
  const [{ data: customers }, { data: products }, { data: store }] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase
      .from("products")
      .select("id, name, price")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("stores")
      .select("pickup_start, pickup_end, closed_days, closed_dates")
      .eq("id", storeId ?? "")
      .maybeSingle(),
  ]);

  const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
  const pickupStart = (store?.pickup_start ?? "").slice(0, 5);
  const pickupEnd = (store?.pickup_end ?? "").slice(0, 5);
  const closedLabels = (store?.closed_days ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)
    .map((n: string) => WEEKDAY_LABELS[Number(n)])
    .filter(Boolean);
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingClosedDates = (store?.closed_dates ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)
    .filter((d: string) => d >= todayStr)
    .sort()
    .map((d: string) => {
      const [, m, day] = d.split("-");
      return `${Number(m)}/${Number(day)}`;
    });
  const pickupHint =
    pickupStart && pickupEnd ? `納品日時の目安：${pickupStart}〜${pickupEnd}` : "";
  const closedHint = closedLabels.length ? `定休日：${closedLabels.join("・")}曜` : "";
  const closedDatesHint = upcomingClosedDates.length
    ? `臨時休業：${upcomingClosedDates.join("・")}`
    : "";

  const customerList = (customers ?? []) as Pick<Customer, "id" | "name">[];
  const productList = (products ?? []) as Pick<
    Product,
    "id" | "name" | "price"
  >[];

  return (
    <div className="space-y-6">
      <Link
        href="/reservations"
        className="text-sm text-bark-700 hover:underline"
      >
        ‹ 注文一覧に戻る
      </Link>

      <h1 className="text-xl font-bold text-bark-900">新規注文の登録</h1>

      <form
        action={createReservation}
        className="space-y-5 rounded-2xl border border-bark-100 bg-white p-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            取引先
          </label>
          <select
            name="customer_id"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
          >
            <option value="">（取引先を指定しない）</option>
            {customerList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            納品日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="pickup_at"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
          />
          {(pickupHint || closedHint || closedDatesHint) && (
            <p className="mt-1 text-xs text-gray-400">
              {[pickupHint, closedHint, closedDatesHint].filter(Boolean).join("　／　")}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            商品と個数
          </label>
          {productList.length === 0 ? (
            <p className="text-sm text-gray-400">
              先に「商品」ページで商品を登録してください。
            </p>
          ) : (
            <div className="space-y-2">
              {productList.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <input type="hidden" name="product_id" value={p.id} />
                  <span className="flex-1 text-sm text-gray-700">
                    {p.name}
                    <span className="ml-2 text-xs text-gray-400">
                      {p.price.toLocaleString()}円
                    </span>
                  </span>
                  <input
                    type="number"
                    name="quantity"
                    min={0}
                    defaultValue={0}
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-bark-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            備考
          </label>
          <textarea
            name="memo"
            rows={2}
            placeholder="例：のし希望、配送先指定など"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-bark-600 px-5 py-2 text-sm font-semibold text-white hover:bg-bark-700"
        >
          注文を登録する
        </button>
      </form>
    </div>
  );
}

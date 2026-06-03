import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Customer, Product } from "@/lib/types";
import { createReservation } from "../actions";

export default async function NewReservationPage() {
  const supabase = await createClient();
  const [{ data: customers }, { data: products }] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase
      .from("products")
      .select("id, name, price")
      .eq("is_active", true)
      .order("name"),
  ]);

  const customerList = (customers ?? []) as Pick<Customer, "id" | "name">[];
  const productList = (products ?? []) as Pick<
    Product,
    "id" | "name" | "price"
  >[];

  return (
    <div className="space-y-6">
      <Link
        href="/reservations"
        className="text-sm text-amber-700 hover:underline"
      >
        ‹ 予約一覧に戻る
      </Link>

      <h1 className="text-xl font-bold text-amber-900">新規予約の登録</h1>

      <form
        action={createReservation}
        className="space-y-5 rounded-2xl border border-amber-100 bg-white p-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            お客様
          </label>
          <select
            name="customer_id"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          >
            <option value="">（顧客を指定しない）</option>
            {customerList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            受取日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="pickup_at"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
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
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-amber-500 focus:outline-none"
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
            placeholder="例：のし希望、アレルギー対応など"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          予約を登録する
        </button>
      </form>
    </div>
  );
}

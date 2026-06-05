import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ReservationStatus } from "@/lib/types";
import SwipeToDelete from "@/components/SwipeToDelete";
import StatusControl from "./StatusControl";
import { deleteReservation } from "./actions";

type ResRow = {
  id: string;
  pickup_at: string;
  status: ReservationStatus;
  memo: string | null;
  customers: { name: string } | null;
  reservation_items: { quantity: number; products: { name: string } | null }[];
};

export default async function ReservationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reservations")
    .select(
      "id, pickup_at, status, memo, customers(name), reservation_items(quantity, products(name))",
    )
    .order("pickup_at", { ascending: true });

  const list = (data ?? []) as unknown as ResRow[];

  // 受取日でグループ化
  const groups = new Map<string, ResRow[]>();
  list.forEach((r) => {
    const d = new Date(r.pickup_at).toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Tokyo",
    });
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d)!.push(r);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bark-900">予約・取り置き管理</h1>
        <Link
          href="/reservations/new"
          className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700"
        >
          ＋ 新規予約
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-bark-100 bg-white p-5 text-sm text-gray-400">
          予約がまだありません。「新規予約」から登録してください。
        </p>
      ) : (
        <div className="space-y-5">
          {[...groups.entries()].map(([date, items]) => (
            <div key={date}>
              <h2 className="mb-2 text-sm font-semibold text-gray-500">{date}</h2>
              <div className="space-y-2">
                {items.map((r) => (
                  <div
                    key={r.id}
                    className="overflow-hidden rounded-2xl border border-bark-100"
                  >
                    <SwipeToDelete onDelete={deleteReservation.bind(null, r.id)}>
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">
                          {r.customers?.name ?? "（顧客未指定）"}
                          <span className="ml-2 text-sm font-normal text-gray-400">
                            {new Date(r.pickup_at).toLocaleTimeString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Tokyo",
                            })}
                            受取
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {r.reservation_items
                            .map(
                              (it) =>
                                `${it.products?.name ?? "（削除商品）"}×${it.quantity}`,
                            )
                            .join("、") || "明細なし"}
                        </p>
                        {r.memo && (
                          <p className="mt-1 text-xs text-gray-400">備考：{r.memo}</p>
                        )}
                      </div>
                      <StatusControl id={r.id} status={r.status} />
                    </div>
                    </SwipeToDelete>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

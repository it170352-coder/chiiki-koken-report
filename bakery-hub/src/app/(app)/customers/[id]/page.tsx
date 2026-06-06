import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Customer, ReservationStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import MemoEditor from "./MemoEditor";

type ResRow = {
  id: string;
  pickup_at: string;
  status: ReservationStatus;
  reservation_items: { quantity: number; products: { name: string } | null }[];
};

export default async function CustomerDetailPage(
  props: PageProps<"/customers/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) notFound();
  const c = customer as Customer;

  const { data: reservations } = await supabase
    .from("reservations")
    .select(
      "id, pickup_at, status, reservation_items(quantity, products(name))",
    )
    .eq("customer_id", id)
    .order("pickup_at", { ascending: false });

  const history = (reservations ?? []) as unknown as ResRow[];
  const visitCount = history.filter((r) => r.status === "completed").length;

  return (
    <div className="space-y-6">
      <Link href="/customers" className="text-sm text-bark-700 hover:underline">
        ‹ 顧客一覧に戻る
      </Link>

      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h1 className="text-xl font-bold text-bark-900">{c.name}</h1>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-400">電話番号</dt>
            <dd className="text-gray-700">{c.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-400">メールアドレス</dt>
            <dd className="text-gray-700">{c.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-400">受取完了回数</dt>
            <dd className="text-gray-700">{visitCount} 回</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-700">メモ（好み・アレルギー等）</h2>
        <MemoEditor customerId={c.id} initialMemo={c.memo ?? ""} />
      </div>

      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-700">予約・購入履歴</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">予約履歴はまだありません。</p>
        ) : (
          <ul className="space-y-3">
            {history.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between border-b border-bark-50 pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm text-gray-700">
                    {new Date(r.pickup_at).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Tokyo",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.reservation_items
                      .map((it) => `${it.products?.name ?? "（削除商品）"}×${it.quantity}`)
                      .join("、") || "明細なし"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

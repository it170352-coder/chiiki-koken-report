"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PublicProduct = { id: string; name: string; price: number };

export default function BookingForm({
  storeId,
  products,
  pickupStart,
  pickupEnd,
  closedDays,
  closedDates,
}: {
  storeId: string;
  products: PublicProduct[];
  pickupStart: string;
  pickupEnd: string;
  closedDays: string[];
  closedDates: string[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pickupAt, setPickupAt] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none";

  function setQty(id: string, v: number) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, v) }));
  }

  // 受取日時が定休日・臨時休業日かどうか（入力中の事前案内用）
  function closedReason(value: string): string {
    if (!value) return "";
    const d = new Date(value);
    const dow = String(d.getDay());
    if (closedDays.includes(dow)) return "選んだ曜日は定休日です。";
    const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (closedDates.includes(ymd)) return "選んだ日は休業日です。";
    return "";
  }

  const dateWarning = closedReason(pickupAt);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const items = products
      .map((p) => ({ product_id: p.id, quantity: quantities[p.id] ?? 0 }))
      .filter((it) => it.quantity > 0);

    if (items.length === 0) {
      setError("商品を1つ以上選んでください。");
      return;
    }
    if (!pickupAt) {
      setError("受取日時を選んでください。");
      return;
    }
    if (dateWarning) {
      setError(dateWarning);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("お名前と電話番号を入力してください。");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("create_public_reservation", {
      p_store: storeId,
      p_name: name.trim(),
      p_phone: phone.trim(),
      p_pickup: new Date(pickupAt).toISOString(),
      p_memo: memo.trim(),
      p_items: items,
    });
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message || "予約の送信に失敗しました。時間をおいてお試しください。");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <section className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-bold text-green-700">予約を受け付けました</p>
        <p className="mt-2 text-sm text-green-700">
          お店からの確認をお待ちください。ありがとうございました。
        </p>
      </section>
    );
  }

  const total = products.reduce(
    (sum, p) => sum + p.price * (quantities[p.id] ?? 0),
    0,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-amber-100 bg-white p-5"
    >
      <h2 className="font-semibold text-gray-700">ご予約内容</h2>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">商品と個数</label>
        {products.length === 0 ? (
          <p className="text-sm text-gray-400">現在予約できる商品がありません。</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-gray-700">
                  {p.name}
                  <span className="ml-2 text-xs text-gray-400">
                    {p.price.toLocaleString()}円
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQty(p.id, (quantities[p.id] ?? 0) - 1)}
                    className="h-8 w-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    aria-label="減らす"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={quantities[p.id] ?? 0}
                    onChange={(e) => setQty(p.id, Number(e.target.value))}
                    className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(p.id, (quantities[p.id] ?? 0) + 1)}
                    className="h-8 w-8 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    aria-label="増やす"
                  >
                    ＋
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {total > 0 && (
          <p className="mt-2 text-right text-sm font-medium text-amber-800">
            合計 {total.toLocaleString()}円
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          受取日時 <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={pickupAt}
          onChange={(e) => setPickupAt(e.target.value)}
          required
          className={inputCls}
        />
        {(pickupStart && pickupEnd) || dateWarning ? (
          <p className={`mt-1 text-xs ${dateWarning ? "text-red-500" : "text-gray-400"}`}>
            {dateWarning || `受取時間の目安：${pickupStart}〜${pickupEnd}`}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="例：高槻 太郎"
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          電話番号 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="例：090-1234-5678"
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">ご要望（任意）</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          placeholder="例：のし希望、アレルギー対応など"
          className={inputCls}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-amber-600 px-5 py-3 text-base font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {submitting ? "送信中…" : "この内容で予約する"}
      </button>
    </form>
  );
}

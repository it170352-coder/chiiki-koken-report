"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/types";
import { completeSale } from "./actions";

type Props = {
  cartItems: CartItem[];
  totalAmount: number;
  onClose: () => void;
};

export default function CheckoutModal({ cartItems, totalAmount, onClose }: Props) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "other">("cash");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const cashReceivedNum = parseInt(cashReceived, 10) || 0;
  const change = paymentMethod === "cash" ? cashReceivedNum - totalAmount : null;
  const canConfirm =
    paymentMethod !== "cash" || (cashReceivedNum >= totalAmount && cashReceivedNum > 0);

  function handleConfirm() {
    startTransition(async () => {
      const { saleId, error } = await completeSale(
        cartItems,
        paymentMethod,
        paymentMethod === "cash" ? cashReceivedNum : null
      );
      if (error) {
        alert(error);
        return;
      }
      router.push(`/pos/receipt/${saleId}`);
    });
  }

  // よく使う預かり金額のボタン
  const quickAmounts = [
    Math.ceil(totalAmount / 1000) * 1000,
    Math.ceil(totalAmount / 1000) * 1000 + 1000,
    Math.ceil(totalAmount / 5000) * 5000,
    10000,
  ].filter((v, i, arr) => v >= totalAmount && arr.indexOf(v) === i).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-bark-900">会計</h2>
        </div>

        <div className="space-y-5 px-5 py-4">
          {/* 合計金額 */}
          <div className="rounded-xl bg-bark-50 px-4 py-3 text-center">
            <p className="text-sm text-gray-500">お会計金額</p>
            <p className="text-3xl font-bold text-bark-900">
              ¥{totalAmount.toLocaleString()}
            </p>
          </div>

          {/* 支払方法 */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">支払方法</p>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "card", "other"] as const).map((method) => {
                const labels = { cash: "現金", card: "カード", other: "その他" };
                return (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition ${
                      paymentMethod === method
                        ? "border-bark-500 bg-bark-500 text-white"
                        : "border-gray-200 text-gray-700 hover:border-bark-300"
                    }`}
                  >
                    {labels[method]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 現金の場合: 預かり金入力 */}
          {paymentMethod === "cash" && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">お預かり金額</p>
              <div className="flex gap-2 flex-wrap mb-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashReceived(String(amt))}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:border-bark-300 hover:bg-bark-50"
                  >
                    ¥{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="金額を入力"
                min={totalAmount}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-right text-lg focus:border-bark-500 focus:outline-none"
              />
              {cashReceivedNum > 0 && change !== null && (
                <div
                  className={`mt-2 rounded-lg px-4 py-2 text-center ${
                    change >= 0
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  <span className="text-sm">お釣り: </span>
                  <span className="font-bold">
                    {change >= 0 ? `¥${change.toLocaleString()}` : "不足しています"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || isPending}
            className="flex-1 rounded-lg bg-bark-600 py-3 text-sm font-bold text-white hover:bg-bark-700 disabled:opacity-40"
          >
            {isPending ? "処理中..." : "確定"}
          </button>
        </div>
      </div>
    </div>
  );
}

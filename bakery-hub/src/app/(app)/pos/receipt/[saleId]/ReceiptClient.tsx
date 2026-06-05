"use client";

import { useRouter } from "next/navigation";
import type { Sale, SaleItem, Store } from "@/lib/types";

type Props = {
  sale: Sale;
  items: SaleItem[];
  store: Store | null;
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "現金",
  card: "カード",
  other: "その他",
};

export default function ReceiptClient({ sale, items, store }: Props) {
  const router = useRouter();

  // 売上日時（JST）
  const soldAt = new Date(sale.sold_at);
  const dateStr = soldAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  });
  const timeStr = soldAt.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  });

  // 8%対象・10%対象の小計を計算
  const items8 = items.filter((i) => Math.abs(i.tax_rate - 0.08) < 0.001);
  const items10 = items.filter((i) => Math.abs(i.tax_rate - 0.10) < 0.001);
  const subtotal8 = items8.reduce((s, i) => s + i.subtotal, 0);
  const subtotal10 = items10.reduce((s, i) => s + i.subtotal, 0);

  return (
    <>
      {/* 印刷時にナビを非表示にするためのグローバルスタイル */}
      <style>{`
        @media print {
          aside, header, nav, .no-print { display: none !important; }
          body { background: white; }
          .print-area { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-sm px-4 py-6">
        {/* 操作ボタン（印刷時非表示） */}
        <div className="no-print mb-4 flex gap-2">
          <button
            onClick={() => router.push("/pos")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            POSに戻る
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-bold text-white hover:bg-bark-700"
          >
            印刷する
          </button>
        </div>

        {/* レシート本体 */}
        <div className="print-area rounded-2xl border border-gray-200 bg-white p-6 shadow-sm font-mono text-sm">
          {/* 店舗情報 */}
          <div className="mb-4 text-center">
            <p className="text-lg font-bold">{store?.name ?? "店舗名"}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              適格簡易請求書
            </p>
          </div>

          {/* レシート番号・日時 */}
          <div className="mb-4 border-t border-dashed border-gray-300 pt-3 text-xs text-gray-600 space-y-0.5">
            <div className="flex justify-between">
              <span>レシート番号</span>
              <span className="font-medium">{sale.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span>日時</span>
              <span>{dateStr} {timeStr}</span>
            </div>
          </div>

          {/* 商品明細 */}
          <div className="border-t border-dashed border-gray-300 pt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-1.5 text-left font-normal">品名</th>
                  <th className="pb-1.5 text-right font-normal">数量</th>
                  <th className="pb-1.5 text-right font-normal">単価</th>
                  <th className="pb-1.5 text-right font-normal">金額</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-0.5 pr-1">
                      {item.product_name}
                      <span className="ml-1 text-gray-400">
                        ※{Math.round(item.tax_rate * 100)}%
                      </span>
                    </td>
                    <td className="py-0.5 text-right">{item.quantity}</td>
                    <td className="py-0.5 text-right">
                      {item.unit_price.toLocaleString()}
                    </td>
                    <td className="py-0.5 text-right font-medium">
                      {item.subtotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 消費税内訳 */}
          <div className="mt-3 border-t border-dashed border-gray-300 pt-3 space-y-1 text-xs">
            {subtotal8 > 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>※8%対象（軽減税率）</span>
                  <span>¥{subtotal8.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span> うち消費税8%</span>
                  <span>¥{sale.tax_8_amount.toLocaleString()}</span>
                </div>
              </>
            )}
            {subtotal10 > 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>※10%対象</span>
                  <span>¥{subtotal10.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span> うち消費税10%</span>
                  <span>¥{sale.tax_10_amount.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* 合計 */}
          <div className="mt-3 border-t-2 border-gray-800 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>合計（税込）</span>
              <span>¥{sale.total_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* 支払情報 */}
          <div className="mt-3 border-t border-dashed border-gray-300 pt-3 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>支払方法</span>
              <span className="font-medium">
                {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method}
              </span>
            </div>
            {sale.payment_method === "cash" && sale.cash_received != null && (
              <>
                <div className="flex justify-between">
                  <span>お預かり</span>
                  <span>¥{sale.cash_received.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>お釣り</span>
                  <span>¥{(sale.change_amount ?? 0).toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* フッター */}
          <div className="mt-5 text-center text-xs text-gray-400">
            <p>ありがとうございました</p>
            <p className="mt-1">※は軽減税率（8%）対象商品</p>
          </div>
        </div>
      </div>
    </>
  );
}

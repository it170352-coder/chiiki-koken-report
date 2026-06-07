"use client";

import { useState, useTransition } from "react";
import InventoryRow from "./InventoryRow";
import { saveAllInventoryLogs } from "./actions";

type ProductRow = {
  id: string;
  name: string;
  produced: number;
  sold: number;
  wasted: number;
  prevProduced: number | null;
};

export default function InventoryBulkClient({
  products,
  date,
}: {
  products: ProductRow[];
  date: string;
}) {
  const [values, setValues] = useState<Record<string, { produced: number; sold: number; wasted: number }>>(
    Object.fromEntries(products.map((p) => [p.id, { produced: p.produced, sold: p.sold, wasted: p.wasted }]))
  );
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(productId: string, field: "produced" | "sold" | "wasted", value: number) {
    setValues((prev) => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }));
  }

  function handleSaveAll() {
    const items = products.map((p) => ({
      productId: p.id,
      ...values[p.id],
    }));
    startTransition(async () => {
      const result = await saveAllInventoryLogs(date, items);
      if (!result?.error) setSavedAt(new Date());
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {products.map((p) => (
          <InventoryRow
            key={p.id}
            productId={p.id}
            productName={p.name}
            date={date}
            produced={p.produced}
            sold={p.sold}
            wasted={p.wasted}
            prevProduced={p.prevProduced}
            onChangeExternal={(field, value) => handleChange(p.id, field, value)}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {savedAt && (
          <span className="text-sm text-gray-400">
            最終更新: {savedAt.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        <button
          onClick={handleSaveAll}
          disabled={pending}
          className="rounded-lg bg-bark-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
        >
          {pending ? "保存しています" : "一括保存"}
        </button>
      </div>
    </div>
  );
}

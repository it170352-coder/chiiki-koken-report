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
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleChange(productId: string, field: "produced" | "sold" | "wasted", value: number) {
    setSaved(false);
    setValues((prev) => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }));
  }

  function handleSaveAll() {
    setSaved(false);
    const items = products.map((p) => ({
      productId: p.id,
      ...values[p.id],
    }));
    startTransition(async () => {
      const result = await saveAllInventoryLogs(date, items);
      if (!result?.error) setSaved(true);
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
        {saved && <span className="text-sm text-green-600 font-medium">すべて保存しました</span>}
        <button
          onClick={handleSaveAll}
          disabled={pending}
          className="rounded-lg bg-bark-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
        >
          {pending ? "保存中..." : "一括保存"}
        </button>
      </div>
    </div>
  );
}

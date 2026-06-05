"use client";

import { useState, useTransition } from "react";
import { applyRecipeTemplate, type TemplateItem } from "./actions";

const TEMPLATES: { label: string; items: TemplateItem[] }[] = [
  {
    label: "塩パン",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.1, unit: "kg" },
      { ingredientName: "バター", usageQuantity: 0.02, unit: "kg" },
      { ingredientName: "食塩", usageQuantity: 0.003, unit: "kg" },
      { ingredientName: "ドライイースト", usageQuantity: 0.002, unit: "kg" },
    ],
  },
  {
    label: "食パン",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.3, unit: "kg" },
      { ingredientName: "牛乳", usageQuantity: 0.15, unit: "L" },
      { ingredientName: "バター", usageQuantity: 0.03, unit: "kg" },
      { ingredientName: "上白糖", usageQuantity: 0.02, unit: "kg" },
      { ingredientName: "食塩", usageQuantity: 0.005, unit: "kg" },
      { ingredientName: "ドライイースト", usageQuantity: 0.005, unit: "kg" },
    ],
  },
  {
    label: "カレーパン",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.12, unit: "kg" },
      { ingredientName: "カレー", usageQuantity: 0.05, unit: "kg" },
      { ingredientName: "サラダ油", usageQuantity: 0.01, unit: "L" },
      { ingredientName: "ドライイースト", usageQuantity: 0.003, unit: "kg" },
    ],
  },
  {
    label: "あんぱん",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.1, unit: "kg" },
      { ingredientName: "あんこ", usageQuantity: 0.04, unit: "kg" },
      { ingredientName: "上白糖", usageQuantity: 0.01, unit: "kg" },
      { ingredientName: "ドライイースト", usageQuantity: 0.002, unit: "kg" },
    ],
  },
  {
    label: "クリームパン",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.1, unit: "kg" },
      { ingredientName: "カスタード", usageQuantity: 0.04, unit: "kg" },
      { ingredientName: "鶏卵", usageQuantity: 0.5, unit: "個" },
      { ingredientName: "ドライイースト", usageQuantity: 0.002, unit: "kg" },
    ],
  },
  {
    label: "クロワッサン",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.08, unit: "kg" },
      { ingredientName: "薄力粉", usageQuantity: 0.02, unit: "kg" },
      { ingredientName: "バター", usageQuantity: 0.05, unit: "kg" },
      { ingredientName: "牛乳", usageQuantity: 0.05, unit: "L" },
      { ingredientName: "ドライイースト", usageQuantity: 0.002, unit: "kg" },
    ],
  },
  {
    label: "チョコパン",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.1, unit: "kg" },
      { ingredientName: "チョコレート", usageQuantity: 0.03, unit: "kg" },
      { ingredientName: "上白糖", usageQuantity: 0.01, unit: "kg" },
      { ingredientName: "ドライイースト", usageQuantity: 0.002, unit: "kg" },
    ],
  },
  {
    label: "惣菜パン（ハム）",
    items: [
      { ingredientName: "強力粉", usageQuantity: 0.1, unit: "kg" },
      { ingredientName: "ハム", usageQuantity: 0.03, unit: "kg" },
      { ingredientName: "ピザチーズ", usageQuantity: 0.02, unit: "kg" },
      { ingredientName: "ドライイースト", usageQuantity: 0.002, unit: "kg" },
    ],
  },
];

export default function RecipeTemplateButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleApply(template: typeof TEMPLATES[0]) {
    startTransition(async () => {
      const result = await applyRecipeTemplate(productId, template.items);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `「${template.label}」テンプレートを${result?.added}件追加しました` });
      }
      setOpen(false);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setMessage(null); }}
        className="rounded-lg border border-bark-300 px-3 py-1.5 text-xs font-medium text-bark-700 hover:bg-bark-100 active:scale-95 active:bg-bark-200 transition-all"
      >
        テンプレートから追加
      </button>

      {message && (
        <p className={`mt-1 text-xs ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
          {message.text}
        </p>
      )}

      {open && (
        <div className="absolute left-0 top-9 z-10 w-56 rounded-xl border border-bark-200 bg-white shadow-lg">
          <p className="border-b border-bark-100 px-3 py-2 text-xs font-semibold text-gray-500">テンプレートを選択</p>
          <ul className="py-1">
            {TEMPLATES.map((t) => (
              <li key={t.label}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleApply(t)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-bark-50 disabled:opacity-50"
                >
                  {t.label}
                  <span className="ml-1 text-xs text-gray-400">({t.items.length}種)</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

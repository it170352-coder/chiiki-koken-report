"use client";

import { useRef, useState, useTransition } from "react";
import { importProducts, importInventory, importIngredients } from "./importActions";

type ImportType = "products" | "inventory" | "ingredients";

const TEMPLATES: Record<ImportType, { headers: string; example: string; label: string }> = {
  products: {
    label: "商品",
    headers: "商品名,カテゴリ,価格",
    example: "クロワッサン,パン,250\nあんパン,菓子パン,180",
  },
  inventory: {
    label: "在庫",
    headers: "商品名,製造数,販売数,廃棄数",
    example: "クロワッサン,30,25,2\nあんパン,20,18,1",
  },
  ingredients: {
    label: "原材料",
    headers: "カテゴリ,名前,単位,最低在庫,仕入単価,仕入先",
    example: "粉類,強力粉,kg,10,200,〇〇商店\n乳製品,バター,g,500,50,",
  },
};

function downloadTemplate(type: ImportType) {
  const t = TEMPLATES[type];
  const csv = "﻿" + t.headers + "\n" + t.example;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `テンプレート_${t.label}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(",").map((v) => v.trim()))
    .filter((row) => row.some((v) => v));
}

export default function CsvImportButton({ type, date }: { type: ImportType; date?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) ?? "";
      const rows = parseCsv(text);
      if (rows.length < 2) { setResult({ imported: 0, errors: ["データ行がありません"] }); return; }
      const dataRows = rows.slice(1); // ヘッダー除く

      startTransition(async () => {
        let res: { imported: number; errors: string[] };
        if (type === "products") {
          res = await importProducts(dataRows.map((r) => ({ name: r[0] ?? "", category: r[1] ?? "", price: Number(r[2]) || 0 })));
        } else if (type === "inventory") {
          res = await importInventory(
            dataRows.map((r) => ({ name: r[0] ?? "", produced: Number(r[1]) || 0, sold: Number(r[2]) || 0, wasted: Number(r[3]) || 0 })),
            date ?? new Date().toISOString().slice(0, 10)
          );
        } else {
          res = await importIngredients(dataRows.map((r) => ({
            category: r[0] ?? "", name: r[1] ?? "", unit: r[2] ?? "",
            minimum_stock: Number(r[3]) || 0, purchase_price: Number(r[4]) || 0, supplier: r[5] ?? "",
          })));
        }
        setResult(res);
        if (inputRef.current) inputRef.current.value = "";
      });
    };
    reader.readAsText(file, "utf-8");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => downloadTemplate(type)}
        className="rounded-lg border border-bark-300 px-3 py-1.5 text-xs font-medium text-bark-700 hover:bg-bark-50"
      >
        テンプレDL
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => { setResult(null); inputRef.current?.click(); }}
        className="rounded-lg border border-bark-300 px-3 py-1.5 text-xs font-medium text-bark-700 hover:bg-bark-50 disabled:opacity-50"
      >
        {pending ? "取込中..." : "CSVインポート"}
      </button>
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

      {result && (
        <div className={`text-xs ${result.errors.length > 0 ? "text-amber-600" : "text-green-600"}`}>
          {result.imported}件追加
          {result.errors.length > 0 && (
            <span className="ml-1 text-red-500">/ エラー{result.errors.length}件: {result.errors[0]}</span>
          )}
        </div>
      )}
    </div>
  );
}

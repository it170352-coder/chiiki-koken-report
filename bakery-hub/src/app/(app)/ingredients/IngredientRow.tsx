"use client";

import { useState, useTransition } from "react";
import type { Ingredient, IngredientStatus } from "@/lib/types";
import { getIngredientStatus } from "@/lib/types";
import { updateStock, deleteIngredient } from "./actions";

function StatusBadge({ status }: { status: IngredientStatus }) {
  if (status === "order") {
    return (
      <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        発注推奨
      </span>
    );
  }
  if (status === "caution") {
    return (
      <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
        注意
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
      正常
    </span>
  );
}

export default function IngredientRow({ ingredient }: { ingredient: Ingredient }) {
  const [stock, setStock] = useState(ingredient.stock_quantity);
  const [inputValue, setInputValue] = useState(String(ingredient.stock_quantity));
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleting, startDeleteTransition] = useTransition();

  const status = getIngredientStatus({ ...ingredient, stock_quantity: stock });

  function handleMinus() {
    const n = Math.max(0, stock - 1);
    setStock(n);
    setInputValue(String(n));
    setSaved(false);
  }

  function handlePlus() {
    const n = stock + 1;
    setStock(n);
    setInputValue(String(n));
    setSaved(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleInputBlur() {
    const n = Math.max(0, parseFloat(inputValue) || 0);
    setStock(n);
    setInputValue(String(n));
    setSaved(false);
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateStock(ingredient.id, stock);
      setSaved(true);
    });
  }

  function handleDelete() {
    if (!confirm(`「${ingredient.name}」を削除しますか？`)) return;
    startDeleteTransition(async () => {
      await deleteIngredient(ingredient.id);
    });
  }

  return (
    <div className="rounded-2xl border border-bark-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[8rem] flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{ingredient.name}</span>
            <StatusBadge status={status} />
          </div>
          <div className="mt-0.5 text-xs text-gray-400">
            最低在庫: {ingredient.minimum_stock} {ingredient.unit}
            {ingredient.supplier && ` · 仕入先: ${ingredient.supplier}`}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex flex-col items-center text-xs text-gray-400">
          在庫数（{ingredient.unit}）
          <div className="mt-1 flex items-center gap-1">
            <button
              type="button"
              onClick={handleMinus}
              className="h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold text-gray-500 hover:bg-gray-50"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              step="any"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm text-gray-900 focus:border-bark-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={handlePlus}
              className="h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold text-gray-500 hover:bg-gray-50"
            >
              ＋
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={pending}
          className="self-center rounded-lg bg-bark-600 px-3 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
        >
          {pending ? "保存中" : saved ? "保存済" : "保存"}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="self-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
        >
          削除
        </button>
      </div>
    </div>
  );
}

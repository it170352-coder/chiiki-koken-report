"use client";

import { useState, useTransition } from "react";
import { saveInventoryLog } from "./actions";

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [inputValue, setInputValue] = useState(String(value));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleBlur() {
    const n = Math.max(0, parseInt(inputValue, 10) || 0);
    setInputValue(String(n));
    onChange(n);
  }

  function handleMinus() {
    const n = Math.max(0, value - 1);
    setInputValue(String(n));
    onChange(n);
  }

  function handlePlus() {
    const n = value + 1;
    setInputValue(String(n));
    onChange(n);
  }

  return (
    <div className="flex flex-col items-center text-xs text-gray-400">
      {label}
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          aria-label={`${label}を1減らす`}
          onClick={handleMinus}
          className="h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold text-gray-500 hover:bg-gray-50"
        >
          −
        </button>
        <input
          type="number"
          min={0}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-center text-sm text-gray-900 focus:border-bark-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`${label}を1増やす`}
          onClick={handlePlus}
          className="h-8 w-8 rounded-lg border border-gray-300 text-lg font-bold text-gray-500 hover:bg-gray-50"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

export default function InventoryRow({
  productId,
  productName,
  date,
  produced,
  sold,
  wasted,
  prevProduced,
  onChangeExternal,
}: {
  productId: string;
  productName: string;
  date: string;
  produced: number;
  sold: number;
  wasted: number;
  prevProduced: number | null;
  onChangeExternal?: (field: "produced" | "sold" | "wasted", value: number) => void;
}) {
  const [p, setP] = useState(produced);
  const [s, setS] = useState(sold);
  const [w, setW] = useState(wasted);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const remaining = p - s - w;

  function handleSave() {
    const fd = new FormData();
    fd.set("product_id", productId);
    fd.set("date", date);
    fd.set("produced", String(p));
    fd.set("sold", String(s));
    fd.set("wasted", String(w));
    setSaved(false);
    startTransition(async () => {
      await saveInventoryLog(fd);
      setSaved(true);
    });
  }

  return (
    <div className="rounded-2xl border border-bark-100 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <span className="min-w-[6rem] flex-1 self-center font-medium text-gray-800">
          {productName}
        </span>
        <Stepper
          label="製造"
          value={p}
          onChange={(v) => { setP(v); setSaved(false); onChangeExternal?.("produced", v); }}
        />
        <Stepper
          label="販売"
          value={s}
          onChange={(v) => { setS(v); setSaved(false); onChangeExternal?.("sold", v); }}
        />
        <Stepper
          label="廃棄"
          value={w}
          onChange={(v) => { setW(v); setSaved(false); onChangeExternal?.("wasted", v); }}
        />
        <div className="flex flex-col items-center text-xs text-gray-400">
          残数
          <span
            className={`mt-1 w-14 text-center text-base font-bold ${
              remaining < 0 ? "text-red-500" : "text-bark-700"
            }`}
          >
            {remaining}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={pending}
          className="self-center rounded-lg bg-bark-600 px-3 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
        >
          {pending ? "保存中" : saved ? "保存済" : "保存"}
        </button>
      </div>
      {prevProduced !== null && prevProduced !== p && (
        <button
          type="button"
          onClick={() => {
            setP(prevProduced);
            setSaved(false);
          }}
          className="mt-2 text-xs text-bark-700 hover:underline"
        >
          前日の製造数（{prevProduced}）をコピー
        </button>
      )}
    </div>
  );
}

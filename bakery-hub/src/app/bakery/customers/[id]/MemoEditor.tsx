"use client";

import { useState, useTransition } from "react";
import { updateCustomerMemo } from "../actions";

export default function MemoEditor({
  customerId,
  initialMemo,
}: {
  customerId: string;
  initialMemo: string;
}) {
  const [memo, setMemo] = useState(initialMemo);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateCustomerMemo(customerId, memo);
      setSaved(true);
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={memo}
        onChange={(e) => {
          setMemo(e.target.value);
          setSaved(false);
        }}
        rows={3}
        placeholder="例：くるみパンが好き。卵アレルギーあり。"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-bark-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
        >
          {pending ? "保存しています" : "メモを保存"}
        </button>
        {saved && <span className="text-sm text-green-600">保存しました</span>}
      </div>
    </div>
  );
}

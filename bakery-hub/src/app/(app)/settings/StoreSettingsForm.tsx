"use client";

import { useState, useTransition } from "react";
import { updateStoreSettings } from "./actions";

const WEEKDAYS = [
  { value: "0", label: "日" },
  { value: "1", label: "月" },
  { value: "2", label: "火" },
  { value: "3", label: "水" },
  { value: "4", label: "木" },
  { value: "5", label: "金" },
  { value: "6", label: "土" },
];

export default function StoreSettingsForm({
  storeName,
  pickupStart,
  pickupEnd,
  closedDays,
}: {
  storeName: string;
  pickupStart: string;
  pickupEnd: string;
  closedDays: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMsg(null);
    startTransition(async () => {
      const res = await updateStoreSettings(fd);
      if ("error" in res) setMsg({ ok: false, text: res.error });
      else setMsg({ ok: true, text: "保存しました。" });
    });
  }

  const inputCls =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">店舗名</label>
        <input
          name="store_name"
          defaultValue={storeName}
          placeholder="例：高槻ベーカリー本店"
          className={`w-full ${inputCls}`}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">受取可能な時間帯</label>
        <div className="flex items-center gap-2 text-sm">
          <input type="time" name="pickup_start" defaultValue={pickupStart} className={inputCls} />
          <span className="text-gray-400">〜</span>
          <input type="time" name="pickup_end" defaultValue={pickupEnd} className={inputCls} />
        </div>
        <p className="mt-1 text-xs text-gray-400">予約フォームの受取時間の目安として表示されます。</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">定休日</label>
        <div className="flex flex-wrap gap-3">
          {WEEKDAYS.map((d) => (
            <label key={d.value} className="flex items-center gap-1 text-sm text-gray-700">
              <input
                type="checkbox"
                name="closed_days"
                value={d.value}
                defaultChecked={closedDays.includes(d.value)}
                className="h-4 w-4 accent-amber-600"
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      {msg && (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存する"}
      </button>
    </form>
  );
}

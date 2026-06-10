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

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

export default function StoreSettingsForm({
  pickupStart,
  pickupEnd,
  closedDays,
  closedDates,
  customerMode,
}: {
  pickupStart: string;
  pickupEnd: string;
  closedDays: string[];
  closedDates: string[];
  customerMode: string;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dates, setDates] = useState<string[]>(() =>
    [...new Set(closedDates)].sort(),
  );
  const [dateInput, setDateInput] = useState("");

  function addDate() {
    if (!dateInput) return;
    setDates((prev) =>
      prev.includes(dateInput) ? prev : [...prev, dateInput].sort(),
    );
    setDateInput("");
  }

  function removeDate(d: string) {
    setDates((prev) => prev.filter((x) => x !== d));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMsg(null);
    startTransition(async () => {
      const res = await updateStoreSettings(fd);
      if ("error" in res) setMsg({ ok: false, text: res.error });
      else setMsg({ ok: true, text: "保存しました" });
    });
  }

  const inputCls =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">顧客タイプ</label>
        <div className="flex gap-3">
          {[
            { value: "individual", label: "個人客", desc: "氏名・電話番号で管理" },
            { value: "corporate", label: "法人・企業", desc: "会社名・担当者名で管理" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex flex-1 cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 has-[:checked]:border-bark-500 has-[:checked]:bg-bark-50"
            >
              <input
                type="radio"
                name="customer_mode"
                value={opt.value}
                defaultChecked={customerMode === opt.value}
                className="mt-0.5 accent-bark-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
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
        <label className="mb-2 block text-sm font-medium text-gray-700">定休日（毎週）</label>
        <div className="flex flex-wrap gap-3">
          {WEEKDAYS.map((d) => (
            <label key={d.value} className="flex items-center gap-1 text-sm text-gray-700">
              <input
                type="checkbox"
                name="closed_days"
                value={d.value}
                defaultChecked={closedDays.includes(d.value)}
                className="h-4 w-4 accent-bark-600"
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">臨時休業日（カレンダーで指定）</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className={inputCls}
          />
          <button
            type="button"
            onClick={addDate}
            className="rounded-lg border border-bark-300 bg-bark-50 px-3 py-2 text-sm font-medium text-bark-700 hover:bg-bark-100"
          >
            ＋ 追加
          </button>
        </div>
        {dates.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {dates.map((d) => (
              <li
                key={d}
                className="flex items-center gap-1 rounded-full bg-bark-100 py-1 pl-3 pr-1 text-sm text-bark-800"
              >
                <input type="hidden" name="closed_dates" value={d} />
                {formatDate(d)}
                <button
                  type="button"
                  onClick={() => removeDate(d)}
                  aria-label={`${formatDate(d)}を削除`}
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-bark-700 hover:bg-bark-200"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-gray-400">
            お盆・年末年始などの臨時休業日を、日付ごとに追加できます。
          </p>
        )}
      </div>

      {msg && (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
      >
        {pending ? "保存しています" : "保存"}
      </button>
    </form>
  );
}

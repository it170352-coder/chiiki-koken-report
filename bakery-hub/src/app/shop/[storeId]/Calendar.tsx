"use client";

import { useState } from "react";

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Calendar({
  closedDays,
  closedDates,
  value,
  onChange,
}: {
  closedDays: string[];
  closedDates: string[];
  value: string;
  onChange: (date: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 今月より前には戻れない
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function isClosed(d: Date) {
    if (closedDays.includes(String(d.getDay()))) return true;
    if (closedDates.includes(ymd(d))) return true;
    return false;
  }

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="rounded px-2 py-1 text-sm text-amber-700 hover:bg-amber-50 disabled:text-gray-300"
        >
          ‹ 前の月
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {year}年{month + 1}月
        </span>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="rounded px-2 py-1 text-sm text-amber-700 hover:bg-amber-50"
        >
          次の月 ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {WEEK.map((w, i) => (
          <div key={w} className={i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : ""}>
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = ymd(d);
          const past = d < today;
          const closed = isClosed(d);
          const disabled = past || closed;
          const selected = value === key;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key)}
              className={[
                "flex h-9 items-center justify-center rounded-lg text-sm",
                selected
                  ? "bg-amber-600 font-bold text-white"
                  : disabled
                    ? "text-gray-300 line-through"
                    : "text-gray-700 hover:bg-amber-50",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-gray-400">
        取り消し線の日は休業日・過去日のため選べません。
      </p>
    </div>
  );
}

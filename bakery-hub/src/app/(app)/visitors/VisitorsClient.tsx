"use client";

import { useState, useTransition } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { saveHourlyVisitors } from "./actions";

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

type HourlyData = { hour: number; count: number };

type Props = {
  date: string;
  initialData: HourlyData[];
};

export default function VisitorsClient({ date, initialData }: Props) {
  const [counts, setCounts] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    for (const h of HOURS) {
      const found = initialData.find((d) => d.hour === h);
      map[h] = found?.count ?? 0;
    }
    return map;
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = HOURS.reduce((sum, h) => sum + (counts[h] ?? 0), 0);

  const chartData = HOURS.map((h) => ({
    hour: `${h}時`,
    来客数: counts[h] ?? 0,
  }));

  function handleChange(hour: number, raw: string) {
    const n = parseInt(raw, 10);
    setCounts((prev) => ({ ...prev, [hour]: isNaN(n) || n < 0 ? 0 : n }));
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const data = HOURS.map((h) => ({ hour: h, count: counts[h] ?? 0 }));
        await saveHourlyVisitors(date, data);
        setSaved(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* 合計 */}
      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <p className="text-sm text-gray-500">本日の来客数合計</p>
        <p className="mt-1 text-3xl font-bold text-bark-900">
          {total.toLocaleString()}
          <span className="ml-1 text-sm font-normal text-gray-400">人</span>
        </p>
      </div>

      {/* 入力グリッド */}
      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">時間帯別 来客数入力</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {HOURS.map((h) => (
            <div key={h} className="flex flex-col items-center gap-1">
              <label className="text-xs font-medium text-gray-500">{h}時</label>
              <input
                type="number"
                min={0}
                value={counts[h] ?? 0}
                onChange={(e) => handleChange(h, e.target.value)}
                onBlur={(e) => handleChange(h, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-bark-600 px-5 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
          >
            {isPending ? "保存中..." : "一括保存"}
          </button>
          {saved && <p className="text-sm text-green-600">保存しました</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {/* グラフ */}
      <div className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">時間帯別 来客数グラフ</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8df" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [`${value}人`, "来客数"]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5d5c5", fontSize: 12 }}
            />
            <Bar dataKey="来客数" fill="#baa08a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);
const STORAGE_KEY = "visitors_hours_range";
const DEFAULT_START = 6;
const DEFAULT_END = 21;

type HourlyData = { hour: number; count: number };

type Props = {
  view: string;
  date: string;
  month: string;
  initialData: HourlyData[];
  monthlyData: { hour: number; avg: number }[];
};

function HourInput({
  hour,
  value,
  onChange,
}: {
  hour: number;
  value: number;
  onChange: (hour: number, value: number) => void;
}) {
  const [inputValue, setInputValue] = useState(String(value));

  function handleBlur() {
    const n = Math.max(0, parseInt(inputValue, 10) || 0);
    setInputValue(String(n));
    onChange(hour, n);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <label className="text-xs font-medium text-gray-500">{hour}時</label>
      <input
        type="number"
        min={0}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm text-gray-900 focus:border-bark-500 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

export default function VisitorsClient({ view, date, month, initialData, monthlyData }: Props) {
  const router = useRouter();
  const [startHour, setStartHour] = useState(DEFAULT_START);
  const [endHour, setEndHour] = useState(DEFAULT_END);
  const [showSettings, setShowSettings] = useState(false);
  const [tempStart, setTempStart] = useState(DEFAULT_START);
  const [tempEnd, setTempEnd] = useState(DEFAULT_END);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { start, end } = JSON.parse(saved);
        if (typeof start === "number" && typeof end === "number") {
          setStartHour(start);
          setEndHour(end);
          setTempStart(start);
          setTempEnd(end);
        }
      }
    } catch {}
  }, []);

  const HOURS = ALL_HOURS.filter((h) => h >= startHour && h <= endHour);

  const buildCounts = (data: HourlyData[]) => {
    const map: Record<number, number> = {};
    for (const h of ALL_HOURS) {
      const found = data.find((d) => d.hour === h);
      map[h] = found?.count ?? 0;
    }
    return map;
  };

  const [counts, setCounts] = useState<Record<number, number>>(() => buildCounts(initialData));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCounts(buildCounts(initialData));
    setSaved(false);
    setError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function applyHourSettings() {
    const s = Math.min(tempStart, tempEnd);
    const e = Math.max(tempStart, tempEnd);
    setStartHour(s);
    setEndHour(e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ start: s, end: e }));
    setShowSettings(false);
  }

  const total = HOURS.reduce((sum, h) => sum + (counts[h] ?? 0), 0);

  const chartData = HOURS.map((h) => ({
    hour: `${h}時`,
    来客数: counts[h] ?? 0,
  }));

  function handleChange(hour: number, value: number) {
    setCounts((prev) => ({ ...prev, [hour]: value }));
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
        setError(e instanceof Error ? e.message : "保存できませんでした");
      }
    });
  }

  const monthlyChartData = monthlyData.map((d) => ({
    hour: `${d.hour}時`,
    平均来客数: d.avg,
  }));

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-1 rounded-xl border border-bark-100 bg-bark-50 p-1 w-fit">
        <button
          onClick={() => router.push(`/visitors?date=${date}`)}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${view !== "monthly" ? "bg-white text-bark-900 shadow-sm" : "text-gray-500 hover:text-bark-700"}`}
        >
          日別
        </button>
        <button
          onClick={() => router.push(`/visitors?view=monthly&month=${month}`)}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${view === "monthly" ? "bg-white text-bark-900 shadow-sm" : "text-gray-500 hover:text-bark-700"}`}
        >
          月間
        </button>
      </div>

      {view === "monthly" ? (
        <>
          {/* 月間グラフ */}
          <div className="rounded-2xl border border-bark-100 bg-white p-5">
            <h2 className="mb-1 font-semibold text-gray-700">時間帯別 来客数（{month.replace("-", "年")}月 平均）</h2>
            <p className="mb-4 text-xs text-gray-400">今月の時間帯ごとの平均来客数</p>
            {monthlyChartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">この月のデータがありません</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyChartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
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
                    formatter={(value) => [`${value}人`, "平均来客数"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5d5c5", fontSize: 12 }}
                  />
                  <Bar dataKey="平均来客数" fill="#baa08a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      ) : (
        <>
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">時間帯別 来客数入力</h2>
          <button
            onClick={() => { setShowSettings((v) => !v); setTempStart(startHour); setTempEnd(endHour); }}
            className="flex items-center gap-1 rounded-lg border border-bark-200 px-3 py-1.5 text-xs font-medium text-bark-700 hover:bg-bark-50"
          >
            ⚙️ 時間帯を変更
          </button>
        </div>

        {/* 時間帯設定パネル */}
        {showSettings && (
          <div className="mb-4 rounded-xl border border-bark-200 bg-bark-50 p-4">
            <p className="mb-3 text-sm font-medium text-bark-900">営業時間の範囲を設定</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">開始</label>
                <select
                  value={tempStart}
                  onChange={(e) => setTempStart(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
                >
                  {ALL_HOURS.map((h) => (
                    <option key={h} value={h}>{h}時</option>
                  ))}
                </select>
              </div>
              <span className="text-gray-400">〜</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">終了</label>
                <select
                  value={tempEnd}
                  onChange={(e) => setTempEnd(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
                >
                  {ALL_HOURS.map((h) => (
                    <option key={h} value={h}>{h}時</option>
                  ))}
                </select>
              </div>
              <button
                onClick={applyHourSettings}
                className="rounded-lg bg-bark-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-bark-700"
              >
                適用
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                キャンセル
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">設定はこのブラウザに保存されます</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {HOURS.map((h) => (
            <HourInput key={h} hour={h} value={counts[h] ?? 0} onChange={handleChange} />
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-bark-600 px-5 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
          >
            {isPending ? "保存しています" : "一括保存"}
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
        </>
      )}
    </div>
  );
}

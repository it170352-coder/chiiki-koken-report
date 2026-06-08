"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

type Props = {
  data: { date: string; total: number }[];
};

export default function DashboardVisitorsChart({ data }: Props) {
  const chartData = data.map((d) => ({
    day: `${Number(d.date.slice(8))}日`,
    来客数: d.total,
  }));

  const total = data.reduce((sum, d) => sum + d.total, 0);

  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const monthLabel = `${now.getUTCMonth() + 1}月`;

  return (
    <div className="rounded-2xl border border-bark-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">{monthLabel}の来客数</h2>
          <p className="mt-0.5 text-xs text-gray-400">合計 {total.toLocaleString()} 人</p>
        </div>
        <Link href="/visitors" className="text-xs font-medium text-bark-600 hover:underline">
          入力する →
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[160px] flex-col items-center justify-center gap-2 text-gray-400">
          <p className="text-sm">データなし</p>
          <Link href="/visitors" className="text-xs text-bark-600 hover:underline">
            来客数を入力する
          </Link>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8df" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval={chartData.length > 15 ? 1 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [`${value}人`, "来客数"]}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5d5c5", fontSize: 12 }}
            />
            <Bar dataKey="来客数" fill="#df9f58" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

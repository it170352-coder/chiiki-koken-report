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
  data: { hour: number; count: number }[];
};

export default function DashboardVisitorsChart({ data }: Props) {
  const chartData = data.map((d) => ({
    hour: `${d.hour}時`,
    来客数: d.count,
  }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-2xl border border-bark-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">本日の来客数</h2>
        <Link href="/visitors" className="text-xs font-medium text-bark-600 hover:underline">
          入力する →
        </Link>
      </div>

      {total === 0 ? (
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
              dataKey="hour"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
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

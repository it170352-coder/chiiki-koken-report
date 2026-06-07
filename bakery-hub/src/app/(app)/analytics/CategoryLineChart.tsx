"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: Record<string, string | number>[];
  categories: string[];
};

const COLORS = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#e67e22", "#16a085"];

function formatYen(v: number) {
  if (v >= 10000) return `¥${(v / 10000).toFixed(0)}万`;
  return `¥${v.toLocaleString()}`;
}

export default function CategoryLineChart({ data, categories }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">データがありません。</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d8" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v: number) => formatYen(v)}
          width={52}
        />
        <Tooltip
          formatter={(value: unknown, name: unknown) => [`¥${Number(value).toLocaleString()}`, String(name)]}
          labelFormatter={(label) => String(label)}
          contentStyle={{ borderRadius: 8, border: "1px solid #f3e8d8", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {categories.map((cat, i) => (
          <Line
            key={cat}
            type="monotone"
            dataKey={cat}
            name={cat}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

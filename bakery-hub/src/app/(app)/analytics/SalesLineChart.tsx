"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: { date: string; sales: number }[];
};

function formatYen(v: number) {
  if (v >= 10000) return `¥${(v / 10000).toFixed(0)}万`;
  return `¥${v.toLocaleString()}`;
}

export default function SalesLineChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">この期間の記録はありません</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d8" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={formatYen}
          width={52}
        />
        <Tooltip
          formatter={(value: unknown) => [`¥${Number(value).toLocaleString()}`, "売上"]}
          labelFormatter={(label) => String(label)}
          contentStyle={{ borderRadius: 8, border: "1px solid #f3e8d8", fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#a0622a"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#a0622a", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

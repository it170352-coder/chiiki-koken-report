"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  data: { day: number; sales: number; count: number }[];
};

export default function DayOfWeekChart({ data }: Props) {
  if (data.every((d) => d.sales === 0)) {
    return <p className="text-sm text-gray-400">データがありません。</p>;
  }

  const chartData = DAY_LABELS.map((label, i) => {
    const d = data.find((x) => x.day === i);
    return {
      label,
      sales: d?.sales ?? 0,
      count: d?.count ?? 0,
      avg: d && d.count > 0 ? Math.round(d.sales / d.count) : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d8" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v: number) => v >= 10000 ? `¥${(v / 10000).toFixed(0)}万` : `¥${v.toLocaleString()}`}
          width={56}
        />
        <Tooltip
          formatter={(value: unknown) => [`¥${Number(value).toLocaleString()}`, "平均売上"]}
          labelFormatter={(label) => `${String(label)}曜日`}
          contentStyle={{ borderRadius: 8, border: "1px solid #f3e8d8", fontSize: 12 }}
        />
        <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 || i === 6 ? "#c49a6c" : "#a0622a"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

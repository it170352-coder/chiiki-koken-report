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

type Props = {
  data: { hour: number; avg: number }[];
};

export default function HourlyChart({ data }: Props) {
  if (data.every((d) => d.avg === 0)) {
    return <p className="text-sm text-gray-400">来客数データがありません。</p>;
  }

  const chartData = data.map((d) => ({
    label: `${d.hour}時`,
    avg: Math.round(d.avg * 10) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8d8" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} interval={1} />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickFormatter={(v: number) => `${v}人`}
          width={40}
        />
        <Tooltip
          formatter={(value: unknown) => [`${Number(value)}人`, "平均来客数"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #f3e8d8", fontSize: 12 }}
        />
        <Bar dataKey="avg" fill="#a0622a" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

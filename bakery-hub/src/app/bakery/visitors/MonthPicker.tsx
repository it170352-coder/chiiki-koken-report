"use client";

import { useRouter } from "next/navigation";

export default function MonthPicker({ month }: { month: string }) {
  const router = useRouter();

  return (
    <input
      type="month"
      defaultValue={month}
      onChange={(e) => {
        if (e.target.value) router.push(`/visitors?view=monthly&month=${e.target.value}`);
      }}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
    />
  );
}

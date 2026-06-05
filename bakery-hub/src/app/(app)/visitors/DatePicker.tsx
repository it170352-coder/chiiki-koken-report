"use client";

import { useRouter } from "next/navigation";

export default function DatePicker({ date }: { date: string }) {
  const router = useRouter();

  return (
    <input
      type="date"
      defaultValue={date}
      onChange={(e) => {
        if (e.target.value) router.push(`/visitors?date=${e.target.value}`);
      }}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-bark-500 focus:outline-none"
    />
  );
}

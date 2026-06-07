"use client";

import type { Shift } from "./shiftActions";
import type { StaffMember } from "../settings/staffActions";
import { STORE_ROLE_LABELS } from "@/lib/types";

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
}

export default function WorkHours({
  shifts,
  staffMembers,
}: {
  shifts: Shift[];
  staffMembers: StaffMember[];
}) {
  const byUser = new Map<string, { hours: number; days: Set<string> }>();
  for (const s of shifts) {
    const cur = byUser.get(s.user_id) ?? { hours: 0, days: new Set() };
    cur.hours += calcHours(s.start_time, s.end_time);
    cur.days.add(s.date);
    byUser.set(s.user_id, cur);
  }

  if (staffMembers.length === 0) {
    return <p className="text-sm text-gray-400">スタッフが登録されていません。</p>;
  }

  return (
    <div className="space-y-3">
      {staffMembers.map((m) => {
        const data = byUser.get(m.userId);
        const hours = data?.hours ?? 0;
        const days = data?.days.size ?? 0;
        return (
          <div
            key={m.userId}
            className="flex items-center justify-between rounded-xl border border-bark-100 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{m.email}</p>
              <p className="text-xs text-gray-400">{STORE_ROLE_LABELS[m.role]}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-bark-800">{hours.toFixed(1)} h</p>
              <p className="text-xs text-gray-400">{days} 日出勤</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

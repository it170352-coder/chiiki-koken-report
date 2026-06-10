"use client";

import CsvDownloadButton from "@/components/CsvDownloadButton";
import type { Shift } from "./shiftActions";
import type { StaffMember } from "../settings/staffActions";
import { STORE_ROLE_LABELS } from "@/lib/types";

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
}

export default function WorkHoursCsvButton({
  shifts,
  staffMembers,
  from,
  to,
}: {
  shifts: Shift[];
  staffMembers: StaffMember[];
  from: string;
  to: string;
}) {
  const byUser = new Map<string, { hours: number; days: Set<string> }>();
  for (const s of shifts) {
    const cur = byUser.get(s.user_id) ?? { hours: 0, days: new Set<string>() };
    cur.hours += calcHours(s.start_time, s.end_time);
    cur.days.add(s.date);
    byUser.set(s.user_id, cur);
  }

  const rows = staffMembers.map((m) => {
    const d = byUser.get(m.userId);
    return [
      m.name || m.email,
      m.email,
      STORE_ROLE_LABELS[m.role],
      d?.days.size ?? 0,
      (d?.hours ?? 0).toFixed(1),
    ];
  });

  return (
    <CsvDownloadButton
      filename={`勤務時間_${from}_${to}.csv`}
      headers={["名前", "メール", "権限", "出勤日数", "合計時間（h）"]}
      rows={rows}
      label="勤務時間CSV"
    />
  );
}

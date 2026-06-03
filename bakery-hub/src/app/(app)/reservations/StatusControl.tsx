"use client";

import { useTransition } from "react";
import type { ReservationStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { updateReservationStatus } from "./actions";

const ORDER: ReservationStatus[] = ["pending", "ready", "completed", "cancelled"];

export default function StatusControl({
  id,
  status,
}: {
  id: string;
  status: ReservationStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() =>
          updateReservationStatus(id, e.target.value as ReservationStatus),
        )
      }
      className={`shrink-0 cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 ${STATUS_COLORS[status]}`}
    >
      {ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useTransition } from "react";
import type { ReservationStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_LABELS_CORPORATE, STATUS_COLORS } from "@/lib/types";
import { updateReservationStatus } from "./actions";

const ORDER: ReservationStatus[] = ["pending", "ready", "completed", "cancelled"];

export default function StatusControl({
  id,
  status,
  isCorporate,
}: {
  id: string;
  status: ReservationStatus;
  isCorporate?: boolean;
}) {
  const labels = isCorporate ? STATUS_LABELS_CORPORATE : STATUS_LABELS;
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
      className={`shrink-0 cursor-pointer rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bark-400 ${STATUS_COLORS[status]}`}
    >
      {ORDER.map((s) => (
        <option key={s} value={s}>
          {labels[s]}
        </option>
      ))}
    </select>
  );
}

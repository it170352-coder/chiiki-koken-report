"use client";

import { useState, useTransition } from "react";
import { upsertShift, deleteShift, type Shift } from "./shiftActions";
import type { StaffMember } from "../settings/staffActions";
import { STORE_ROLE_LABELS } from "@/lib/types";

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
}

type ShiftFormProps = {
  staffMembers: StaffMember[];
  date: string;
  existing?: Shift;
  onClose: () => void;
};

function ShiftForm({ staffMembers, date, existing, onClose }: ShiftFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await upsertShift(fd);
      onClose();
    });
  }

  function handleDelete() {
    if (!existing || !confirm("このシフトを削除しますか？")) return;
    startTransition(async () => {
      await deleteShift(existing.id);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 font-semibold text-bark-900">
          {existing ? "シフトを編集" : "シフトを追加"} — {date}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {existing && <input type="hidden" name="id" value={existing.id} />}
          <input type="hidden" name="date" value={date} />

          <div>
            <label className="mb-1 block text-xs text-gray-500">スタッフ</label>
            <select
              name="user_id"
              defaultValue={existing?.user_id ?? ""}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            >
              <option value="">選択してください</option>
              {staffMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.email}（{STORE_ROLE_LABELS[m.role]}）
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">開始時刻</label>
              <input
                type="time"
                name="start_time"
                defaultValue={existing?.start_time?.slice(0, 5) ?? "09:00"}
                required
                className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">終了時刻</label>
              <input
                type="time"
                name="end_time"
                defaultValue={existing?.end_time?.slice(0, 5) ?? "17:00"}
                required
                className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-bark-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">メモ（任意）</label>
            <input
              type="text"
              name="note"
              defaultValue={existing?.note ?? ""}
              placeholder="例：早番"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-bark-600 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
            >
              {pending ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
          {existing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="w-full rounded-lg border border-red-200 py-2 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              削除
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ShiftCalendar({
  initialShifts,
  staffMembers,
  weekStart,
}: {
  initialShifts: Shift[];
  staffMembers: StaffMember[];
  weekStart: string;
}) {
  const [modal, setModal] = useState<{ date: string; shift?: Shift } | null>(null);
  const base = new Date(`${weekStart}T00:00:00`);
  const days = Array.from({ length: 7 }, (_, i) => addDays(base, i));

  const shiftMap = new Map<string, Shift[]>();
  for (const s of initialShifts) {
    const arr = shiftMap.get(`${s.date}_${s.user_id}`) ?? [];
    arr.push(s);
    shiftMap.set(`${s.date}_${s.user_id}`, arr);
  }

  return (
    <>
      {modal && (
        <ShiftForm
          staffMembers={staffMembers}
          date={modal.date}
          existing={modal.shift}
          onClose={() => setModal(null)}
        />
      )}

      {/* モバイル: カード表示 */}
      <div className="md:hidden space-y-4">
        {days.map((d, di) => {
          const dateStr = toDateStr(d);
          const isWeekend = di === 0 || di === 6;
          const dayShifts = staffMembers.flatMap((m) =>
            (shiftMap.get(`${dateStr}_${m.userId}`) ?? []).map((s) => ({ ...s, member: m }))
          );
          return (
            <div key={di} className="rounded-xl border border-bark-100 bg-white p-4">
              <div className={`mb-2 text-sm font-semibold ${isWeekend ? "text-red-500" : "text-gray-700"}`}>
                {d.getMonth() + 1}/{d.getDate()}（{DAY_LABELS[di]}）
              </div>
              {dayShifts.length === 0 ? (
                <p className="text-xs text-gray-300">シフトなし</p>
              ) : (
                <div className="space-y-2">
                  {dayShifts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setModal({ date: dateStr, shift: s })}
                      className="flex w-full items-center justify-between rounded-lg bg-bark-50 px-3 py-2 text-left text-sm hover:bg-bark-100"
                    >
                      <span className="font-medium text-gray-700">{s.member.email.split("@")[0]}</span>
                      <span className="text-xs text-bark-700">
                        {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                        （{calcHours(s.start_time, s.end_time).toFixed(1)}h）
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setModal({ date: dateStr })}
                className="mt-2 w-full rounded-lg border border-dashed border-bark-200 py-1.5 text-xs text-bark-400 hover:border-bark-400 hover:text-bark-600"
              >
                ＋ シフトを追加
              </button>
            </div>
          );
        })}
      </div>

      {/* PC: テーブル表示 */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr>
              <th className="w-32 pb-2 text-left text-xs font-medium text-gray-400">スタッフ</th>
              {days.map((d, i) => {
                const isWeekend = i === 0 || i === 6;
                return (
                  <th
                    key={i}
                    className={`pb-2 text-center text-xs font-medium ${isWeekend ? "text-red-400" : "text-gray-400"}`}
                  >
                    <div>{d.getMonth() + 1}/{d.getDate()}</div>
                    <div>({DAY_LABELS[i]})</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((member) => (
              <tr key={member.userId} className="border-t border-bark-50">
                <td className="py-2 pr-3">
                  <div className="truncate text-xs font-medium text-gray-700">{member.email.split("@")[0]}</div>
                  <div className="text-xs text-gray-400">{STORE_ROLE_LABELS[member.role]}</div>
                </td>
                {days.map((d, i) => {
                  const dateStr = toDateStr(d);
                  const shifts = shiftMap.get(`${dateStr}_${member.userId}`) ?? [];
                  return (
                    <td key={i} className="px-1 py-2 text-center align-top">
                      {shifts.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setModal({ date: dateStr, shift: s })}
                          className="mb-1 block w-full rounded-lg bg-bark-100 px-1 py-1 text-center text-xs text-bark-800 hover:bg-bark-200"
                        >
                          {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                          <span className="ml-1 text-bark-500">({calcHours(s.start_time, s.end_time).toFixed(1)}h)</span>
                        </button>
                      ))}
                      <button
                        onClick={() => setModal({ date: dateStr })}
                        className="mt-0.5 block w-full rounded-lg border border-dashed border-bark-200 py-1 text-xs text-bark-300 hover:border-bark-400 hover:text-bark-500"
                      >
                        ＋
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

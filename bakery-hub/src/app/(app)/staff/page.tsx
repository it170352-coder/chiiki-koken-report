import Link from "next/link";
import { getStaffList } from "../settings/staffActions";
import { getShifts } from "./shiftActions";
import ShiftCalendar from "./ShiftCalendar";
import WorkHours from "./WorkHours";
import WorkHoursCsvButton from "./WorkHoursCsvButton";

function mondayOf(date: Date) {
  const d = new Date(date);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const TABS = [
  { key: "shift", label: "シフト" },
  { key: "hours", label: "勤務時間" },
];

export default async function StaffPage(props: PageProps<"/staff">) {
  const sp = await props.searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "shift";
  const staff = await getStaffList();

  // シフト週
  const today = new Date();
  const defaultWeek = toDateStr(mondayOf(today));
  const weekStart = typeof sp.week === "string" && sp.week ? sp.week : defaultWeek;
  const weekEnd = toDateStr(addDays(new Date(`${weekStart}T00:00:00`), 6));

  // 勤務時間 期間
  const defaultFrom = toDateStr(new Date(today.getFullYear(), today.getMonth(), 1));
  const defaultTo = toDateStr(today);
  const hoursFrom = typeof sp.from === "string" && sp.from ? sp.from : defaultFrom;
  const hoursTo = typeof sp.to === "string" && sp.to ? sp.to : defaultTo;

  const shifts = (tab === "shift" || tab === "hours")
    ? await getShifts(tab === "shift" ? weekStart : hoursFrom, tab === "shift" ? weekEnd : hoursTo)
    : [];

  const prevWeek = toDateStr(addDays(new Date(`${weekStart}T00:00:00`), -7));
  const nextWeek = toDateStr(addDays(new Date(`${weekStart}T00:00:00`), 7));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-bark-900">シフト管理</h1>

      {/* タブ */}
      <div className="flex gap-2 rounded-2xl border border-bark-100 bg-bark-50 p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/staff?tab=${t.key}`}
            className={`flex-1 rounded-xl py-2 text-center text-sm font-medium transition ${
              tab === t.key ? "bg-white text-bark-900 shadow-sm" : "text-gray-500 hover:text-bark-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* シフトタブ */}
      {tab === "shift" && (
        <div className="rounded-2xl border border-bark-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-700">週間シフト</h2>
            <div className="flex items-center gap-2">
              <Link
                href={`/staff?tab=shift&week=${prevWeek}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                ‹ 前週
              </Link>
              <span className="text-sm text-gray-500">{weekStart.slice(5)} 〜 {weekEnd.slice(5)}</span>
              <Link
                href={`/staff?tab=shift&week=${nextWeek}`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                次週 ›
              </Link>
            </div>
          </div>
          {staff.members.length === 0 ? (
            <p className="text-sm text-gray-400">スタッフが登録されていません。</p>
          ) : (
            <ShiftCalendar
              initialShifts={shifts}
              staffMembers={staff.members}
              weekStart={weekStart}
            />
          )}
        </div>
      )}

      {/* 勤務時間タブ */}
      {tab === "hours" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <WorkHoursCsvButton shifts={shifts} staffMembers={staff.members} from={hoursFrom} to={hoursTo} />
          </div>
          <form method="get" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="tab" value="hours" />
            <input type="date" name="from" defaultValue={hoursFrom}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-bark-500 focus:outline-none" />
            <span className="text-gray-400">〜</span>
            <input type="date" name="to" defaultValue={hoursTo}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-bark-500 focus:outline-none" />
            <button type="submit"
              className="rounded-lg border border-bark-300 px-3 py-1.5 text-sm font-medium text-bark-700 hover:bg-bark-50">
              表示
            </button>
          </form>
          <WorkHours shifts={shifts} staffMembers={staff.members} />
        </div>
      )}
    </div>
  );
}

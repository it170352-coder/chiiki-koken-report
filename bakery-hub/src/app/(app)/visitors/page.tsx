import { getCurrentStore } from "@/lib/store";
import VisitorsClient from "./VisitorsClient";
import DatePicker from "./DatePicker";
import MonthPicker from "./MonthPicker";

function todayJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function currentMonthJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default async function VisitorsPage(props: PageProps<"/visitors">) {
  const sp = await props.searchParams;
  const today = todayJST();
  const view = typeof sp.view === "string" ? sp.view : "daily";
  const date = typeof sp.date === "string" && sp.date ? sp.date : today;
  const month = typeof sp.month === "string" && sp.month ? sp.month : currentMonthJST();

  const { supabase, storeId } = await getCurrentStore();

  let initialData: { hour: number; count: number }[] = [];
  let monthlyData: { date: string; total: number }[] = [];

  if (storeId) {
    if (view === "monthly") {
      const from = `${month}-01`;
      const lastDay = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
      const to = `${month}-${String(lastDay).padStart(2, "0")}`;

      const { data } = await supabase
        .from("hourly_visitors")
        .select("date, visitor_count")
        .eq("store_id", storeId)
        .gte("date", from)
        .lte("date", to);

      const totals: Record<string, number> = {};
      for (const row of data ?? []) {
        totals[row.date] = (totals[row.date] ?? 0) + (row.visitor_count as number);
      }
      monthlyData = Object.entries(totals)
        .map(([d, total]) => ({ date: d, total }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      const { data } = await supabase
        .from("hourly_visitors")
        .select("hour, visitor_count")
        .eq("store_id", storeId)
        .eq("date", date);

      initialData = (data ?? []).map((row) => ({
        hour: row.hour as number,
        count: row.visitor_count as number,
      }));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-bark-900">来客数</h1>
        <div className="flex items-center gap-2">
          {view === "monthly" ? (
            <MonthPicker month={month} />
          ) : (
            <DatePicker date={date} />
          )}
        </div>
      </div>
      <VisitorsClient
        key={view === "monthly" ? `monthly-${month}` : `daily-${date}`}
        view={view}
        date={date}
        month={month}
        initialData={initialData}
        monthlyData={monthlyData}
      />
    </div>
  );
}

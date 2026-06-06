import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import VisitorsClient from "./VisitorsClient";
import DatePicker from "./DatePicker";

// 日本時間の今日の日付を YYYY-MM-DD 形式で返す
function todayJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function VisitorsPage(props: PageProps<"/visitors">) {
  const sp = await props.searchParams;
  const today = todayJST();
  const date = typeof sp.date === "string" && sp.date ? sp.date : today;

  const { supabase, storeId } = await getCurrentStore();

  let initialData: { hour: number; count: number }[] = [];

  if (storeId) {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-bark-900">来客数</h1>
        <DatePicker date={date} />
      </div>
      <VisitorsClient date={date} initialData={initialData} />
    </div>
  );
}

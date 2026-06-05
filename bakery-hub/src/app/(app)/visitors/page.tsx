import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import VisitorsClient from "./VisitorsClient";

// 日本時間の今日の日付を YYYY-MM-DD 形式で返す
function todayJST(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function VisitorsPage() {
  const { supabase, storeId } = await getCurrentStore();
  const today = todayJST();

  let initialData: { hour: number; count: number }[] = [];

  if (storeId) {
    const { data } = await supabase
      .from("hourly_visitors")
      .select("hour, visitor_count")
      .eq("store_id", storeId)
      .eq("date", today);

    initialData = (data ?? []).map((row) => ({
      hour: row.hour as number,
      count: row.visitor_count as number,
    }));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-bark-900">来客数</h1>
      <VisitorsClient date={today} initialData={initialData} />
    </div>
  );
}

"use server";

import { getCurrentStore } from "@/lib/store";

export async function saveHourlyVisitors(
  date: string,
  data: { hour: number; count: number }[],
) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) throw new Error("店舗が見つかりません");

  const rows = data.map((d) => ({
    store_id: storeId,
    date,
    hour: d.hour,
    visitor_count: d.count,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("hourly_visitors")
    .upsert(rows, { onConflict: "store_id,date,hour" });

  if (error) throw new Error(error.message);
}

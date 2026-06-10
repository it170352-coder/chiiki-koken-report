"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";

export type Shift = {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  note: string;
};

export async function getShifts(from: string, to: string): Promise<Shift[]> {
  const { storeId } = await getCurrentStore();
  const supabase = await createClient();
  const { data } = await supabase
    .from("shifts")
    .select("*")
    .eq("store_id", storeId ?? "")
    .gte("date", from)
    .lte("date", to)
    .order("date")
    .order("start_time");
  return (data ?? []) as Shift[];
}

export async function upsertShift(formData: FormData) {
  const { storeId } = await getCurrentStore();
  const supabase = await createClient();

  const id = formData.get("id") as string | null;
  const user_id = String(formData.get("user_id"));
  const date = String(formData.get("date"));
  const start_time = String(formData.get("start_time"));
  const end_time = String(formData.get("end_time"));
  const note = String(formData.get("note") ?? "");

  if (id) {
    await supabase.from("shifts").update({ user_id, date, start_time, end_time, note }).eq("id", id);
  } else {
    await supabase.from("shifts").insert({ store_id: storeId, user_id, date, start_time, end_time, note });
  }
  revalidatePath("/staff");
}

export async function deleteShift(id: string) {
  const supabase = await createClient();
  await supabase.from("shifts").delete().eq("id", id);
  revalidatePath("/staff");
}

"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore, canManageStore } from "@/lib/store";

export async function updateStoreSettings(
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const { supabase, storeId, role } = await getCurrentStore();
  if (!storeId) return { error: "ログインが必要です。" };
  if (!canManageStore(role)) {
    return { error: "店舗設定を変更する権限がありません。" };
  }

  const storeName = String(formData.get("store_name") ?? "").trim();
  const pickupStart = String(formData.get("pickup_start") ?? "") || null;
  const pickupEnd = String(formData.get("pickup_end") ?? "") || null;
  const closedDays = formData
    .getAll("closed_days")
    .map((d) => String(d))
    .filter((d) => /^[0-6]$/.test(d))
    .join(",");

  if (pickupStart && pickupEnd && pickupStart >= pickupEnd) {
    return { error: "受取の終了時間は開始時間より後にしてください。" };
  }

  const { error } = await supabase
    .from("stores")
    .update({
      name: storeName,
      pickup_start: pickupStart,
      pickup_end: pickupEnd,
      closed_days: closedDays,
    })
    .eq("id", storeId);

  if (error) return { error: "保存に失敗しました。時間をおいて再度お試しください。" };

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true };
}

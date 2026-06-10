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

  const pickupStart = String(formData.get("pickup_start") ?? "") || null;
  const pickupEnd = String(formData.get("pickup_end") ?? "") || null;
  const closedDays = formData
    .getAll("closed_days")
    .map((d) => String(d))
    .filter((d) => /^[0-6]$/.test(d))
    .join(",");
  const closedDates = [
    ...new Set(
      formData
        .getAll("closed_dates")
        .map((d) => String(d))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
    ),
  ]
    .sort()
    .join(",");

  if (pickupStart && pickupEnd && pickupStart >= pickupEnd) {
    return { error: "受取の終了時間は開始時間より後にしてください。" };
  }

  const customerMode = String(formData.get("customer_mode") ?? "individual");
  const validMode = customerMode === "corporate" ? "corporate" : "individual";

  const { error } = await supabase
    .from("stores")
    .update({
      pickup_start: pickupStart,
      pickup_end: pickupEnd,
      closed_days: closedDays,
      closed_dates: closedDates,
      customer_mode: validMode,
    })
    .eq("id", storeId);

  if (error) return { error: "保存できませんでした。時間をおいて再度お試しください。" };

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true };
}

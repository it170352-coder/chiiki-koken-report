"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import type { ReservationStatus } from "@/lib/types";

export async function createReservation(formData: FormData) {
  const { supabase, userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) return;

  const customerId = String(formData.get("customer_id") ?? "");
  const pickupAt = String(formData.get("pickup_at") ?? "");
  if (!pickupAt) return;

  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert({
      store_id: storeId,
      user_id: userId,
      customer_id: customerId || null,
      pickup_at: new Date(pickupAt).toISOString(),
      status: "pending",
      memo: String(formData.get("memo") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !reservation) return;

  // 商品明細：product_id[] と quantity[] のペアで送られてくる
  const productIds = formData.getAll("product_id").map(String);
  const quantities = formData.getAll("quantity").map((q) => Number(q));

  const items = productIds
    .map((pid, i) => ({
      reservation_id: reservation.id,
      product_id: pid,
      quantity: quantities[i] || 0,
    }))
    .filter((it) => it.product_id && it.quantity > 0);

  if (items.length > 0) {
    await supabase.from("reservation_items").insert(items);
  }

  revalidatePath("/reservations");
  redirect("/reservations");
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id)
    .eq("store_id", storeId);

  revalidatePath("/reservations");
}

export async function deleteReservation(id: string) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase
    .from("reservations")
    .delete()
    .eq("id", id)
    .eq("store_id", storeId);

  revalidatePath("/reservations");
}

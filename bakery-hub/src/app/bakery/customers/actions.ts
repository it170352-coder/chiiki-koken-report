"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore } from "@/lib/store";

export async function createCustomer(formData: FormData) {
  const { supabase, userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const customerType = String(formData.get("customer_type") ?? "individual");

  await supabase.from("customers").insert({
    store_id: storeId,
    user_id: userId,
    name,
    customer_type: customerType === "corporate" ? "corporate" : "individual",
    contact_person: String(formData.get("contact_person") ?? "").trim() || null,
    department: String(formData.get("department") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    memo: String(formData.get("memo") ?? "").trim() || null,
  });

  revalidatePath("/customers");
}

export async function updateCustomerMemo(id: string, memo: string) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase
    .from("customers")
    .update({ memo })
    .eq("id", id)
    .eq("store_id", storeId);

  revalidatePath(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  const { supabase, storeId } = await getCurrentStore();
  if (!storeId) return;

  await supabase.from("customers").delete().eq("id", id).eq("store_id", storeId);
  revalidatePath("/customers");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id };
}

export async function createCustomer(formData: FormData) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase.from("customers").insert({
    user_id: userId,
    name,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    memo: String(formData.get("memo") ?? "").trim() || null,
  });

  revalidatePath("/customers");
}

export async function updateCustomerMemo(id: string, memo: string) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  await supabase
    .from("customers")
    .update({ memo })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath(`/customers/${id}`);
}

export async function deleteCustomer(id: string) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  await supabase.from("customers").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/customers");
}

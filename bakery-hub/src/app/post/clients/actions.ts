"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export async function createClient_(formData: FormData) {
  const { userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_clients").insert({
    store_id: storeId,
    name: formData.get("name") as string,
    industry: formData.get("industry") as string || null,
    threads_account: formData.get("threads_account") as string || null,
    x_account: formData.get("x_account") as string || null,
    contact_name: formData.get("contact_name") as string || null,
    status: formData.get("status") as string || "active",
    memo: formData.get("memo") as string || null,
  });
  revalidatePath("/post/clients");
  redirect("/post/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_clients").update({
    name: formData.get("name") as string,
    industry: formData.get("industry") as string || null,
    threads_account: formData.get("threads_account") as string || null,
    x_account: formData.get("x_account") as string || null,
    contact_name: formData.get("contact_name") as string || null,
    status: formData.get("status") as string || "active",
    memo: formData.get("memo") as string || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/post/clients");
  redirect("/post/clients");
}

export async function deleteClient(id: string) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_clients").delete().eq("id", id);
  revalidatePath("/post/clients");
  redirect("/post/clients");
}

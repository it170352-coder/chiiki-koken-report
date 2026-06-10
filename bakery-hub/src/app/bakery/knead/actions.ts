"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";

export async function addIdea(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title) return;

  const { storeId } = await getCurrentStore();
  const supabase = await createClient();
  await supabase.from("idea_memos").insert({ store_id: storeId, title, body });
  revalidatePath("/knead");
}

export async function deleteIdea(id: string) {
  const supabase = await createClient();
  await supabase.from("idea_memos").delete().eq("id", id);
  revalidatePath("/knead");
}

export async function updateIdea(id: string, body: string) {
  const supabase = await createClient();
  await supabase.from("idea_memos").update({ body }).eq("id", id);
  revalidatePath("/knead");
}

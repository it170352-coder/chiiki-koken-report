"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export async function createKnowledge(formData: FormData) {
  const { userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) redirect("/login");

  const supabase = await createClient();
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  await supabase.from("post_knowledge").insert({
    store_id: storeId,
    type: formData.get("type") as string || "tip",
    title: formData.get("title") as string,
    content: formData.get("content") as string || null,
    tags: tags.length > 0 ? tags : null,
  });
  revalidatePath("/post/knowledge");
  redirect("/post/knowledge");
}

export async function deleteKnowledge(id: string) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_knowledge").delete().eq("id", id);
  revalidatePath("/post/knowledge");
}

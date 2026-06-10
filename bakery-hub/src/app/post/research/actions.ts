"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export async function createResearch(formData: FormData) {
  const { userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) redirect("/login");

  const supabase = await createClient();
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

  await supabase.from("post_research").insert({
    store_id: storeId,
    title: formData.get("title") as string,
    url: formData.get("url") as string || null,
    summary: formData.get("summary") as string || null,
    memo: formData.get("memo") as string || null,
    category: formData.get("category") as string || null,
    tags: tags.length > 0 ? tags : null,
  });
  revalidatePath("/post/research");
  redirect("/post/research");
}

export async function deleteResearch(id: string) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_research").delete().eq("id", id);
  revalidatePath("/post/research");
}

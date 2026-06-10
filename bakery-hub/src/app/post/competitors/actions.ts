"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export async function createCompetitor(formData: FormData) {
  const { userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_competitors").insert({
    store_id: storeId,
    account_name: formData.get("account_name") as string,
    platform: formData.get("platform") as string || "threads",
    url: formData.get("url") as string || null,
    industry: formData.get("industry") as string || null,
    analysis_memo: formData.get("analysis_memo") as string || null,
    reference_posts: formData.get("reference_posts") as string || null,
  });
  revalidatePath("/post/competitors");
  redirect("/post/competitors");
}

export async function updateCompetitor(id: string, formData: FormData) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_competitors").update({
    account_name: formData.get("account_name") as string,
    platform: formData.get("platform") as string || "threads",
    url: formData.get("url") as string || null,
    industry: formData.get("industry") as string || null,
    analysis_memo: formData.get("analysis_memo") as string || null,
    reference_posts: formData.get("reference_posts") as string || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/post/competitors");
  redirect("/post/competitors");
}

export async function deleteCompetitor(id: string) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_competitors").delete().eq("id", id);
  revalidatePath("/post/competitors");
  redirect("/post/competitors");
}

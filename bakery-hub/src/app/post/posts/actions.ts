"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const { userId, storeId } = await getCurrentStore();
  if (!userId || !storeId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_posts").insert({
    store_id: storeId,
    client_id: formData.get("client_id") as string || null,
    title: formData.get("title") as string,
    body: formData.get("body") as string || null,
    platform: formData.get("platform") as string || "threads",
    scheduled_at: formData.get("scheduled_at") as string || null,
    assignee: formData.get("assignee") as string || null,
    status: formData.get("status") as string || "idea",
    memo: formData.get("memo") as string || null,
  });
  revalidatePath("/post/posts");
  redirect("/post/posts");
}

export async function updatePost(id: string, formData: FormData) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_posts").update({
    client_id: formData.get("client_id") as string || null,
    title: formData.get("title") as string,
    body: formData.get("body") as string || null,
    platform: formData.get("platform") as string || "threads",
    scheduled_at: formData.get("scheduled_at") as string || null,
    assignee: formData.get("assignee") as string || null,
    status: formData.get("status") as string || "idea",
    memo: formData.get("memo") as string || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/post/posts");
  redirect("/post/posts");
}

export async function deletePost(id: string) {
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  await supabase.from("post_posts").delete().eq("id", id);
  revalidatePath("/post/posts");
  redirect("/post/posts");
}

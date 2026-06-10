import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import PostsClient from "./PostsClient";

export default async function PostsPage() {
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const [postsRes, clientsRes] = await Promise.all([
    supabase
      .from("post_posts")
      .select("id, title, status, platform, scheduled_at, client_id, post_clients(name)")
      .eq("store_id", storeId ?? "")
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("post_clients")
      .select("id, name")
      .eq("store_id", storeId ?? "")
      .order("name", { ascending: true }),
  ]);

  return (
    <PostsClient
      posts={postsRes.data ?? []}
      clients={clientsRes.data ?? []}
    />
  );
}

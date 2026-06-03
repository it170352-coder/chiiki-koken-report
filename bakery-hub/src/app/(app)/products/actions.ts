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

export async function createProduct(formData: FormData) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase.from("products").insert({
    user_id: userId,
    name,
    category: String(formData.get("category") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    is_active: true,
  });

  revalidatePath("/products");
}

export async function toggleProduct(id: string, isActive: boolean) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const { supabase, userId } = await getUserId();
  if (!userId) return;

  await supabase.from("products").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/products");
}

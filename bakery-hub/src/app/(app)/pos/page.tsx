import { getCurrentStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { redirect } from "next/navigation";
import PosClient from "./PosClient";

export default async function PosPage() {
  const { supabase, storeId } = await getCurrentStore();

  if (!storeId) {
    redirect("/login");
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  return <PosClient products={(products ?? []) as Product[]} />;
}

import { createClient } from "@/lib/supabase/server";
import type { StoreRole } from "@/lib/types";

// ログイン中ユーザーが所属する店舗（store_id）とその権限（role）を返す。
// 1ユーザー＝1店舗の前提で、最初に見つかった所属を採用する。
export async function getCurrentStore() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, userId: null, storeId: null, role: null as StoreRole | null };
  }

  const { data: member } = await supabase
    .from("store_members")
    .select("store_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    userId: user.id,
    storeId: (member?.store_id ?? null) as string | null,
    role: (member?.role ?? null) as StoreRole | null,
  };
}

// 店舗設定の変更が許可されるロールか
export function canManageStore(role: StoreRole | null): boolean {
  return role === "owner" || role === "manager";
}

// スタッフ管理が許可されるロールか（オーナーのみ）
export function canManageMembers(role: StoreRole | null): boolean {
  return role === "owner";
}

// 分析画面の閲覧が許可されるロールか（オーナー・店長のみ）
export function canViewAnalytics(role: StoreRole | null): boolean {
  return role === "owner" || role === "manager";
}

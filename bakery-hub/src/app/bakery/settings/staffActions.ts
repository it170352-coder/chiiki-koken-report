"use server";

import { revalidatePath } from "next/cache";
import { getCurrentStore, canManageMembers } from "@/lib/store";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StoreRole } from "@/lib/types";

export type StaffMember = {
  userId: string;
  email: string;
  name: string;
  role: StoreRole;
};

export async function getStaffList(): Promise<{
  available: boolean;
  members: StaffMember[];
}> {
  const { storeId, role } = await getCurrentStore();
  if (!storeId || !canManageMembers(role)) {
    return { available: true, members: [] };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { available: false, members: [] };
  }

  const { data: rows } = await admin
    .from("store_members")
    .select("user_id, role")
    .eq("store_id", storeId);

  const { data: list } = await admin.auth.admin.listUsers();
  const userMap = new Map<string, { email: string; name: string }>();
  list?.users.forEach((u) => userMap.set(u.id, {
    email: u.email ?? "",
    name: (u.user_metadata?.store_name as string) ?? "",
  }));

  const members: StaffMember[] = (rows ?? []).map((r) => ({
    userId: r.user_id as string,
    email: userMap.get(r.user_id as string)?.email ?? "（不明）",
    name: userMap.get(r.user_id as string)?.name ?? "",
    role: r.role as StoreRole,
  }));
  // owner を先頭に
  members.sort((a, b) => (a.role === "owner" ? -1 : 1));

  return { available: true, members };
}

export async function createStaff(
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const { storeId, role } = await getCurrentStore();
  if (!storeId) return { error: "ログインが必要です。" };
  if (!canManageMembers(role)) {
    return { error: "スタッフを追加できるのはオーナーのみです。" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const newRole = String(formData.get("role") ?? "staff");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }
  if (password.length < 6) {
    return { error: "パスワードは6文字以上にしてください" };
  }
  if (!["owner", "manager", "employee", "parttime"].includes(newRole)) {
    return { error: "権限の指定が正しくありません。" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "スタッフ追加機能の準備が未完了です（管理者キーが未設定）。管理者にお問い合わせください。",
    };
  }

  // auth ユーザーを作成。user_metadata の join_store_id / role を
  // handle_new_user トリガーが読み取り、この店舗のメンバーに追加する。
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      store_name: name,
      join_store_id: storeId,
      role: newRole,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "このメールアドレスは既に使われています。" };
    }
    return { error: "スタッフの作成に失敗しました。時間をおいてお試しください。" };
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function updateStaff(
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const { storeId, role } = await getCurrentStore();
  if (!storeId) return { error: "ログインが必要です。" };
  if (!canManageMembers(role)) return { error: "オーナーのみ編集できます。" };

  const userId = String(formData.get("userId"));
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const newRole = String(formData.get("role") ?? "") as StoreRole;

  if (!["owner", "manager", "employee", "parttime"].includes(newRole)) {
    return { error: "権限の指定が正しくありません。" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "管理者キーが未設定のため編集できません。" };
  }

  const updates: Record<string, unknown> = { user_metadata: { store_name: name } };
  if (email) updates.email = email;

  const { error: authError } = await admin.auth.admin.updateUserById(userId, updates);
  if (authError) return { error: "メールアドレスの更新に失敗しました。" };

  await admin.from("store_members").update({ role: newRole }).eq("store_id", storeId).eq("user_id", userId);

  revalidatePath("/staff");
  revalidatePath("/settings");
  return { ok: true };
}

export async function removeStaff(
  userId: string,
): Promise<{ error: string } | { ok: true }> {
  const { storeId, role, userId: myId } = await getCurrentStore();
  if (!storeId) return { error: "ログインが必要です。" };
  if (!canManageMembers(role)) {
    return { error: "スタッフを削除できるのはオーナーのみです。" };
  }
  if (userId === myId) {
    return { error: "自分自身は削除できません。" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "管理者キーが未設定のため削除できません。" };
  }

  // この店舗のメンバーであることを確認してから削除
  const { data: member } = await admin
    .from("store_members")
    .select("role")
    .eq("store_id", storeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) return { error: "対象のスタッフが見つかりません。" };
  if (member.role === "owner") return { error: "オーナーは削除できません。" };

  // auth ユーザーごと削除（store_members は on delete cascade で消える）
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: "削除に失敗しました。時間をおいてお試しください。" };

  revalidatePath("/settings");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type PortalRole = "admin" | "user";

function roleOf(metadata: unknown): PortalRole {
  const r = (metadata as { role?: string } | null)?.role;
  return r === "admin" ? "admin" : "user";
}

async function getMe() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function updateUser(
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const me = await getMe();
  if (!me) return { error: "ログインが必要です。" };

  const userId = String(formData.get("userId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId) return { error: "対象ユーザーが不明です。" };
  if (!email) return { error: "メールアドレスを入力してください。" };
  if (password && password.length < 6) {
    return { error: "パスワードは6文字以上にしてください。" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "管理者キーが未設定のため編集できません。" };
  }

  // 対象ユーザーの現在の権限を取得（管理者以外は権限を変更できないため保持する）
  const { data: target } = await admin.auth.admin.getUserById(userId);
  let role = roleOf(target?.user?.user_metadata);

  // 権限の変更はリクエスト者が管理者の場合のみ許可
  if (roleOf(me.user_metadata) === "admin") {
    const requested = String(formData.get("role") ?? "");
    if (requested === "admin" || requested === "user") role = requested;
  }

  const updates: Record<string, unknown> = {
    email,
    user_metadata: { display_name: name, role },
  };
  if (password) updates.password = password;

  const { error } = await admin.auth.admin.updateUserById(userId, updates);
  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "このメールアドレスは既に使われています。" };
    }
    return { error: "更新に失敗しました。時間をおいてお試しください。" };
  }

  revalidatePath("/users");
  return { ok: true };
}

export async function deleteUser(
  userId: string,
): Promise<{ error: string } | { ok: true }> {
  const me = await getMe();
  if (!me) return { error: "ログインが必要です。" };
  if (roleOf(me.user_metadata) !== "admin") {
    return { error: "削除は管理者のみ可能です。" };
  }
  if (userId === me.id) return { error: "自分自身は削除できません。" };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "管理者キーが未設定のため削除できません。" };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: "削除に失敗しました。時間をおいてお試しください。" };

  revalidatePath("/users");
  return { ok: true };
}

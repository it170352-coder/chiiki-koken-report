"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createUser(
  formData: FormData,
): Promise<{ ok: boolean; text: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, text: "ログインが必要です" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "user") === "admin" ? "admin" : "user";

  if (!name) {
    return { ok: false, text: "ユーザー名を入力してください" };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, text: "メールアドレスを正しく入力してください" };
  }
  if (password.length < 6) {
    return { ok: false, text: "パスワードは6文字以上にしてください" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: name, role },
  });

  if (error) {
    return {
      ok: false,
      text: "追加できませんでした。すでに登録済みのメールアドレスの可能性があります。",
    };
  }

  return { ok: true, text: `${email} を追加しました` };
}

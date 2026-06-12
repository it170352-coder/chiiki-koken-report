import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalPasswordForm from "./PortalPasswordForm";
import PortalUserForm from "./PortalUserForm";

export default async function PortalSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">設定</h1>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-semibold text-gray-700">アカウント</h2>
        <p className="text-sm text-gray-500">ログイン中：{user.email}</p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-semibold text-gray-700">パスワード変更</h2>
        <p className="mb-4 text-xs text-gray-400">
          ログイン用のパスワードを変更します。変更後は新しいパスワードでログインしてください。
        </p>
        <PortalPasswordForm />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 font-semibold text-gray-700">ユーザー追加</h2>
        <p className="mb-4 text-xs text-gray-400">
          新しいログインユーザーを作成します。発行したメールアドレスと初期パスワードを本人へ伝えてください。
        </p>
        <PortalUserForm />
      </section>
    </div>
  );
}

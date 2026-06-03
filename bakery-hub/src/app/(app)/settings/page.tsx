import { createClient } from "@/lib/supabase/server";
import StoreSettingsForm from "./StoreSettingsForm";
import PasswordForm from "./PasswordForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_name, pickup_start, pickup_end, closed_days")
    .eq("id", user!.id)
    .single();

  const closedDays = (profile?.closed_days ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-amber-900">設定</h1>

      <section className="rounded-2xl border border-amber-100 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-700">店舗情報</h2>
        <StoreSettingsForm
          storeName={profile?.store_name ?? ""}
          pickupStart={(profile?.pickup_start ?? "").slice(0, 5)}
          pickupEnd={(profile?.pickup_end ?? "").slice(0, 5)}
          closedDays={closedDays}
        />
      </section>

      <section className="rounded-2xl border border-amber-100 bg-white p-5">
        <h2 className="mb-1 font-semibold text-gray-700">パスワード変更</h2>
        <p className="mb-4 text-xs text-gray-400">
          ログイン用のパスワードを変更します。変更後は新しいパスワードでログインしてください。
        </p>
        <PasswordForm />
      </section>

      <section className="rounded-2xl border border-amber-100 bg-white p-5">
        <h2 className="mb-1 font-semibold text-gray-700">アカウント</h2>
        <p className="text-sm text-gray-500">ログイン中：{user?.email}</p>
      </section>
    </div>
  );
}

import { getCurrentStore, canManageStore } from "@/lib/store";
import StoreSettingsForm from "./StoreSettingsForm";
import PasswordForm from "./PasswordForm";
import { STORE_ROLE_LABELS } from "@/lib/types";

export default async function SettingsPage() {
  const { supabase, role, storeId } = await getCurrentStore();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("name, pickup_start, pickup_end, closed_days, closed_dates")
    .eq("id", storeId ?? "")
    .maybeSingle();

  const closedDays = (store?.closed_days ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const closedDates = (store?.closed_dates ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const canEdit = canManageStore(role);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-amber-900">設定</h1>

      {canEdit ? (
        <section className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-700">店舗情報</h2>
          <StoreSettingsForm
            pickupStart={(store?.pickup_start ?? "").slice(0, 5)}
            pickupEnd={(store?.pickup_end ?? "").slice(0, 5)}
            closedDays={closedDays}
            closedDates={closedDates}
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="mb-1 font-semibold text-gray-700">店舗情報</h2>
          <p className="text-sm text-gray-500">
            店舗情報の変更はオーナーまたは店長のみ可能です。
          </p>
        </section>
      )}

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
        {role && (
          <p className="mt-1 text-sm text-gray-500">
            権限：{STORE_ROLE_LABELS[role]}
          </p>
        )}
      </section>
    </div>
  );
}

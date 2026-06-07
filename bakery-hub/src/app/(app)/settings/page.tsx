import { getCurrentStore, canManageStore, canManageMembers } from "@/lib/store";
import StoreSettingsForm from "./StoreSettingsForm";
import PasswordForm from "./PasswordForm";
import ShopLink from "./ShopLink";
import StaffManager from "./StaffManager";
import StaffList from "../staff/StaffList";
import { getStaffList } from "./staffActions";
import { STORE_ROLE_LABELS } from "@/lib/types";

export default async function SettingsPage() {
  const { supabase, role, storeId } = await getCurrentStore();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("name, pickup_start, pickup_end, closed_days, closed_dates, customer_mode")
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
  const canStaff = canManageMembers(role);
  const staff = canStaff
    ? await getStaffList()
    : { available: true, members: [] };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-bark-900">設定</h1>

      {canEdit ? (
        <section className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-700">店舗情報</h2>
          <StoreSettingsForm
            pickupStart={(store?.pickup_start ?? "").slice(0, 5)}
            pickupEnd={(store?.pickup_end ?? "").slice(0, 5)}
            closedDays={closedDays}
            closedDates={closedDates}
            customerMode={store?.customer_mode ?? "individual"}
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-1 font-semibold text-gray-700">店舗情報</h2>
          <p className="text-sm text-gray-500">
            店舗情報の変更はオーナーまたは店長のみ可能です。
          </p>
        </section>
      )}

      {storeId && (
        <section className="rounded-2xl border border-bark-100 bg-white p-5">
          <h2 className="mb-1 font-semibold text-gray-700">お客様用ネット予約ページ</h2>
          <p className="mb-3 text-xs text-gray-400">
            このURLをお客様に共有すると、ログインなしで予約できます（SNSや店頭QRなどに）。
          </p>
          <ShopLink storeId={storeId} />
        </section>
      )}

      {canStaff && (
        <section className="rounded-2xl border border-bark-100 bg-white p-5 space-y-6">
          <div>
            <h2 className="mb-1 font-semibold text-gray-700">スタッフ管理</h2>
            <p className="mb-4 text-xs text-gray-400">
              登録中のスタッフを確認・編集できます。アカウントの追加・削除はオーナーのみ可能です。
            </p>
            <StaffList members={staff.members} />
          </div>
          <StaffManager
            initialMembers={staff.members}
            available={staff.available}
          />
        </section>
      )}

      <section className="rounded-2xl border border-bark-100 bg-white p-5">
        <h2 className="mb-1 font-semibold text-gray-700">パスワード変更</h2>
        <p className="mb-4 text-xs text-gray-400">
          ログイン用のパスワードを変更します。変更後は新しいパスワードでログインしてください。
        </p>
        <PasswordForm />
      </section>

      <section className="rounded-2xl border border-bark-100 bg-white p-5">
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

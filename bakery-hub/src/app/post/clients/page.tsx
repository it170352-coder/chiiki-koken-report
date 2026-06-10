import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = { active: "稼働中", paused: "一時停止", ended: "終了" };
const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  ended: "bg-gray-100 text-gray-500",
};

export default async function ClientsPage() {
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("post_clients")
    .select("*")
    .eq("store_id", storeId ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">クライアント管理</h1>
          <p className="text-sm text-gray-600 mt-0.5">担当クライアントとSNSアカウントを管理</p>
        </div>
        <Link href="/post/clients/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
          + 追加
        </Link>
      </div>

      {(!clients || clients.length === 0) ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">クライアントがまだ登録されていません。</p>
          <Link href="/post/clients/new" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
            最初のクライアントを追加する
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-200">
          {clients.map((c) => (
            <Link key={c.id} href={`/post/clients/${c.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-100 transition-colors">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-gray-900 text-sm font-bold">{c.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-500">{c.industry ?? "業種未設定"}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                {c.threads_account && <span className="text-xs text-gray-500">Threads: {c.threads_account}</span>}
                {c.x_account && <span className="text-xs text-gray-500">X: {c.x_account}</span>}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_LABEL[c.status] ?? c.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

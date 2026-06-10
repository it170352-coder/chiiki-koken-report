import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export default async function CompetitorsPage() {
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("post_competitors")
    .select("*")
    .eq("store_id", storeId ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">競合分析</h1>
          <p className="text-sm text-gray-600 mt-0.5">競合アカウントを分析・参考投稿を蓄積</p>
        </div>
        <Link href="/post/competitors/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
          + 追加
        </Link>
      </div>

      {(!items || items.length === 0) ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">競合アカウントがまだ登録されていません。</p>
          <Link href="/post/competitors/new" className="mt-3 inline-block text-blue-600 hover:underline text-sm">最初の競合を追加する</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.id} href={`/post/competitors/${item.id}`}
              className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{item.account_name}</p>
                  <p className="text-xs text-gray-500">{item.industry ?? "業種未設定"}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 uppercase">{item.platform}</span>
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="block text-xs text-blue-600 hover:underline truncate">{item.url}</a>
              )}
              {item.analysis_memo && (
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{item.analysis_memo}</p>
              )}
              <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("ja-JP")}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

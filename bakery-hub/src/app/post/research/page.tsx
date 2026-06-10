import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

export default async function ResearchPage() {
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("post_research")
    .select("*")
    .eq("store_id", storeId ?? "")
    .order("created_at", { ascending: false });

  const categories = [...new Set((items ?? []).map((i) => i.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">情報収集</h1>
          <p className="text-sm text-gray-600 mt-0.5">記事・ニュース・トレンド情報を保存・管理</p>
        </div>
        <Link href="/post/research/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
          + 保存
        </Link>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{cat}</span>
          ))}
        </div>
      )}

      {(!items || items.length === 0) ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">情報がまだ保存されていません。</p>
          <Link href="/post/research/new" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
            最初の情報を追加する
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                {item.category && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 shrink-0">{item.category}</span>
                )}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:underline truncate">{item.url}</a>
              )}
              {item.summary && <p className="text-xs text-gray-600 leading-relaxed">{item.summary}</p>}
              {item.memo && <p className="text-xs text-gray-500 italic">{item.memo}</p>}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t: string) => (
                    <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">#{t}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("ja-JP")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

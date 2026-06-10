import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

const TYPE_LABEL: Record<string, string> = {
  success: "成功事例", failure: "失敗事例", idea: "投稿アイデア",
  hashtag: "ハッシュタグ", industry: "業界ノウハウ", tip: "運用メモ",
};
const TYPE_COLOR: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  failure: "bg-red-100 text-red-600",
  idea: "bg-yellow-100 text-yellow-700",
  hashtag: "bg-blue-100 text-blue-700",
  industry: "bg-purple-100 text-purple-700",
  tip: "bg-gray-200 text-gray-700",
};

export default async function KnowledgePage() {
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("post_knowledge")
    .select("*")
    .eq("store_id", storeId ?? "")
    .order("created_at", { ascending: false });

  const grouped = Object.keys(TYPE_LABEL).reduce<Record<string, typeof items>>((acc, t) => {
    acc[t] = (items ?? []).filter((i) => i.type === t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ナレッジ管理</h1>
          <p className="text-sm text-gray-600 mt-0.5">成功事例・失敗事例・ノウハウを蓄積</p>
        </div>
        <Link href="/post/knowledge/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
          + 追加
        </Link>
      </div>

      {(!items || items.length === 0) ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">ナレッジがまだ登録されていません。</p>
          <Link href="/post/knowledge/new" className="mt-3 inline-block text-blue-600 hover:underline text-sm">最初のナレッジを追加する</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(TYPE_LABEL).map(([type, label]) => {
            const group = grouped[type] ?? [];
            if (group.length === 0) return null;
            return (
              <section key={type}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${TYPE_COLOR[type]}`}>{label}</span>
                  <span className="text-gray-400">{group.length}件</span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      {item.content && <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{item.content}</p>}
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

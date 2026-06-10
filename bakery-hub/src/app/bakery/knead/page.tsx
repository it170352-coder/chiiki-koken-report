import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import { addIdea } from "./actions";
import IdeaCard from "./IdeaCard";

export default async function KneadPage() {
  const { storeId } = await getCurrentStore();
  const supabase = await createClient();

  const { data } = await supabase
    .from("idea_memos")
    .select("*")
    .eq("store_id", storeId ?? "")
    .order("created_at", { ascending: false });

  const ideas = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-bark-900">案をこねる</h1>
        <p className="mt-1 text-sm text-gray-400">新商品や改善のアイデアをストックしておく場所です</p>
      </div>

      {/* 追加フォーム */}
      <form action={addIdea} className="rounded-2xl border border-bark-100 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-gray-700">新しいアイデアを追加</h2>
        <input
          name="title"
          required
          placeholder="アイデアのタイトル（例：塩バターロール）"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
        />
        <textarea
          name="body"
          rows={3}
          placeholder="詳細メモ（材料・インスピレーション・価格帯など）"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700"
        >
          追加
        </button>
      </form>

      {/* 一覧 */}
      {ideas.length === 0 ? (
        <div className="rounded-2xl border border-bark-100 bg-white p-8 text-center text-sm text-gray-400">
          まだアイデアがありません。上のフォームから追加してみましょう！
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea: { id: string; title: string; body: string; created_at: string }) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}

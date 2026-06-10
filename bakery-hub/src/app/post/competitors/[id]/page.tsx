import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { updateCompetitor, deleteCompetitor } from "../actions";

export default async function CompetitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: c } = await supabase.from("post_competitors").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();

  const update = updateCompetitor.bind(null, id);
  const del = deleteCompetitor.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/competitors" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900">{c.account_name}</h1>
      </div>
      <form action={update} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">アカウント名 *</label>
          <input type="text" name="account_name" defaultValue={c.account_name} required
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">プラットフォーム</label>
            <select name="platform" defaultValue={c.platform}
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="threads">Threads</option>
              <option value="x">X (Twitter)</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">業種</label>
            <input type="text" name="industry" defaultValue={c.industry ?? ""}
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
          <input type="url" name="url" defaultValue={c.url ?? ""}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">分析メモ</label>
          <textarea name="analysis_memo" rows={5} defaultValue={c.analysis_memo ?? ""}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">参考投稿</label>
          <textarea name="reference_posts" rows={3} defaultValue={c.reference_posts ?? ""}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500">保存</button>
          <form action={del}>
            <button type="submit" className="rounded-lg border border-red-300 px-5 py-2 text-sm text-red-600 hover:bg-red-50">削除</button>
          </form>
        </div>
      </form>
    </div>
  );
}

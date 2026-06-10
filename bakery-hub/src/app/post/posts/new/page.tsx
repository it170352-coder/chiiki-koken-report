import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "../actions";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const sp = await searchParams;
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: clients } = await supabase.from("post_clients").select("id, name").eq("store_id", storeId ?? "").eq("status", "active");

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/posts" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900">投稿追加</h1>
      </div>
      <form action={createPost} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">クライアント</label>
          <select name="client_id" defaultValue={sp.client ?? ""}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
            <option value="">未選択</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
          <input type="text" name="title" required className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">投稿本文</label>
          <textarea name="body" rows={5}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none"
            placeholder="投稿テキストを入力..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">投稿媒体</label>
            <select name="platform" className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="threads">Threads</option>
              <option value="x">X (Twitter)</option>
              <option value="both">両方</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
            <select name="status" className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="idea">ネタ</option>
              <option value="planning">企画中</option>
              <option value="writing">作成中</option>
              <option value="review">確認中</option>
              <option value="posted">投稿済</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">投稿予定日</label>
            <input type="date" name="scheduled_at" className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">担当者</label>
            <input type="text" name="assignee" className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
          <textarea name="memo" rows={2} className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500">追加する</button>
          <Link href="/post/posts" className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}

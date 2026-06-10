import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { updatePost, deletePost } from "../actions";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const [postRes, clientsRes] = await Promise.all([
    supabase.from("post_posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("post_clients").select("id, name").eq("store_id", storeId ?? ""),
  ]);
  if (!postRes.data) notFound();
  const p = postRes.data;
  const clients = clientsRes.data ?? [];

  const update = updatePost.bind(null, id);
  const del = deletePost.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/posts" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{p.title}</h1>
      </div>
      <form action={update} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">クライアント</label>
          <select name="client_id" defaultValue={p.client_id ?? ""}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
            <option value="">未選択</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
          <input type="text" name="title" defaultValue={p.title} required
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">投稿本文</label>
          <textarea name="body" rows={6} defaultValue={p.body ?? ""}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">投稿媒体</label>
            <select name="platform" defaultValue={p.platform}
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="threads">Threads</option>
              <option value="x">X (Twitter)</option>
              <option value="both">両方</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
            <select name="status" defaultValue={p.status}
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
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
            <input type="date" name="scheduled_at" defaultValue={p.scheduled_at ?? ""}
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">担当者</label>
            <input type="text" name="assignee" defaultValue={p.assignee ?? ""}
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
          <textarea name="memo" rows={2} defaultValue={p.memo ?? ""}
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

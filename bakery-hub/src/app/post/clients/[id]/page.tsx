import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";
import { updateClient, deleteClient } from "../actions";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const { data: c } = await supabase.from("post_clients").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();

  const { data: posts } = await supabase
    .from("post_posts")
    .select("id, title, status, scheduled_at, platform")
    .eq("client_id", id)
    .order("scheduled_at", { ascending: true })
    .limit(10);

  const STATUS_LABEL: Record<string, string> = { idea: "ネタ", planning: "企画中", writing: "作成中", review: "確認中", posted: "投稿済" };
  const STATUS_COLOR: Record<string, string> = {
    idea: "bg-gray-200 text-gray-700", planning: "bg-yellow-100 text-yellow-700",
    writing: "bg-blue-100 text-blue-700", review: "bg-purple-100 text-purple-700", posted: "bg-green-100 text-green-700",
  };

  const update = updateClient.bind(null, id);
  const del = deleteClient.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/clients" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900">{c.name}</h1>
      </div>

      <form action={update} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">基本情報</h2>
        <Field label="クライアント名 *" name="name" defaultValue={c.name} required />
        <Field label="業種" name="industry" defaultValue={c.industry} />
        <Field label="Threadsアカウント" name="threads_account" defaultValue={c.threads_account} />
        <Field label="Xアカウント" name="x_account" defaultValue={c.x_account} />
        <Field label="担当者名" name="contact_name" defaultValue={c.contact_name} />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
          <select name="status" defaultValue={c.status}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
            <option value="active">稼働中</option>
            <option value="paused">一時停止</option>
            <option value="ended">終了</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
          <textarea name="memo" rows={3} defaultValue={c.memo ?? ""}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500">保存</button>
          <form action={del}>
            <button type="submit" className="rounded-lg border border-red-300 px-5 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={(e) => { if (!confirm("削除しますか？")) e.preventDefault(); }}>
              削除
            </button>
          </form>
        </div>
      </form>

      {/* 関連投稿 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">関連投稿</h2>
          <Link href={`/post/posts/new?client=${id}`} className="text-xs text-blue-600 hover:underline">+ 投稿追加</Link>
        </div>
        {(!posts || posts.length === 0) ? (
          <p className="text-sm text-gray-500">投稿はまだありません。</p>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-200">
            {posts.map((p) => (
              <Link key={p.id} href={`/post/posts/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors">
                <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                <span className="flex-1 text-sm text-gray-900 truncate">{p.title}</span>
                <span className="text-xs text-gray-500">{p.scheduled_at ?? "-"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string | null; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type="text" name={name} defaultValue={defaultValue ?? ""} required={required}
        className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
    </div>
  );
}

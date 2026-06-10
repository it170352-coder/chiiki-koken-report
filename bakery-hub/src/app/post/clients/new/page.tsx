import Link from "next/link";
import { createClient_ } from "../actions";

export default function NewClientPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/clients" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900">クライアント追加</h1>
      </div>
      <form action={createClient_} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <Field label="クライアント名 *" name="name" required />
        <Field label="業種" name="industry" placeholder="例：飲食店、美容室、EC" />
        <Field label="Threadsアカウント" name="threads_account" placeholder="@username" />
        <Field label="Xアカウント" name="x_account" placeholder="@username" />
        <Field label="担当者名" name="contact_name" />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
          <select name="status" defaultValue="active"
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
            <option value="active">稼働中</option>
            <option value="paused">一時停止</option>
            <option value="ended">終了</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">メモ</label>
          <textarea name="memo" rows={3}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-none"
            placeholder="特記事項・注意点など" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
            追加する
          </button>
          <Link href="/post/clients"
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:border-gray-300">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, placeholder, required }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type="text" name={name} required={required} placeholder={placeholder}
        className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
    </div>
  );
}

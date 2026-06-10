import Link from "next/link";
import { createResearch } from "../actions";

export default function NewResearchPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/research" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900">情報を保存</h1>
      </div>
      <form action={createResearch} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
          <input type="text" name="title" required className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
          <input type="url" name="url" placeholder="https://..." className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">要約</label>
          <textarea name="summary" rows={3} className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none"
            placeholder="記事の要点・ポイントをメモ" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">活用メモ</label>
          <textarea name="memo" rows={2} className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none"
            placeholder="どう使えるか、何に使えるか" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">カテゴリー</label>
            <input type="text" name="category" placeholder="例：トレンド・業界・競合"
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">タグ（カンマ区切り）</label>
            <input type="text" name="tags" placeholder="SNS, 飲食, トレンド"
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500">保存する</button>
          <Link href="/post/research" className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}

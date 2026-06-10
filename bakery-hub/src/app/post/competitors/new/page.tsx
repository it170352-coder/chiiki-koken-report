import Link from "next/link";
import { createCompetitor } from "../actions";

export default function NewCompetitorPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/competitors" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900">競合アカウント追加</h1>
      </div>
      <form action={createCompetitor} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">アカウント名 *</label>
          <input type="text" name="account_name" required placeholder="@username"
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">プラットフォーム</label>
            <select name="platform" className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
              <option value="threads">Threads</option>
              <option value="x">X (Twitter)</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">業種</label>
            <input type="text" name="industry" placeholder="例：飲食、美容、EC"
              className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
          <input type="url" name="url" placeholder="https://..."
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">分析メモ（なぜ伸びているか・何が参考になるか）</label>
          <textarea name="analysis_memo" rows={4}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none"
            placeholder="投稿の特徴、エンゲージメントが高い理由、参考にすべき点など" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">参考投稿（URLや内容メモ）</label>
          <textarea name="reference_posts" rows={3}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none"
            placeholder="特に参考になった投稿のURLや内容" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500">追加する</button>
          <Link href="/post/competitors" className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}

import Link from "next/link";
import { createKnowledge } from "../actions";

export default function NewKnowledgePage() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/post/knowledge" className="text-gray-500 hover:text-gray-900 text-sm">← 戻る</Link>
        <h1 className="text-xl font-bold text-gray-900">ナレッジ追加</h1>
      </div>
      <form action={createKnowledge} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">種別</label>
          <select name="type" className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900">
            <option value="success">成功事例</option>
            <option value="failure">失敗事例</option>
            <option value="idea">投稿アイデア</option>
            <option value="hashtag">ハッシュタグ</option>
            <option value="industry">業界ノウハウ</option>
            <option value="tip">運用メモ</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">タイトル *</label>
          <input type="text" name="title" required
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900"
            placeholder="例：飲食店向けの朝投稿は7時台が効果的" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">内容・詳細</label>
          <textarea name="content" rows={5}
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 resize-none"
            placeholder="具体的な内容・根拠・活用方法など" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">タグ（カンマ区切り）</label>
          <input type="text" name="tags" placeholder="飲食, 朝投稿, エンゲージメント"
            className="w-full rounded-lg bg-gray-100 border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500">追加する</button>
          <Link href="/post/knowledge" className="rounded-lg border border-gray-300 px-6 py-2 text-sm text-gray-700">キャンセル</Link>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { deleteIdea, updateIdea } from "./actions";

export default function IdeaCard({
  idea,
}: {
  idea: { id: string; title: string; body: string; created_at: string };
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(idea.body);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateIdea(idea.id, body);
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`「${idea.title}」を削除しますか？`)) return;
    startTransition(async () => {
      await deleteIdea(idea.id);
    });
  }

  const date = new Date(idea.created_at).toLocaleDateString("ja-JP", {
    month: "numeric", day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-bark-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-semibold text-bark-900">{idea.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{date}</span>
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
          >
            {editing ? "閉じる" : "編集"}
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg border border-red-100 px-2 py-1 text-xs text-red-400 hover:bg-red-50 disabled:opacity-50"
          >
            削除
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            placeholder="アイデアのメモ..."
          />
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-bark-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
          >
            {pending ? "保存中" : "保存"}
          </button>
        </div>
      ) : (
        idea.body && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{idea.body}</p>
        )
      )}
    </div>
  );
}

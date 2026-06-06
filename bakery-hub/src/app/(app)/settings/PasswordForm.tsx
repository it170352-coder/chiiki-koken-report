"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PasswordForm() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 6) {
      setMsg({ ok: false, text: "パスワードは6文字以上で入力してください。" });
      return;
    }
    if (pw !== pw2) {
      setMsg({ ok: false, text: "確認用パスワードが一致しません。" });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) {
      setMsg({ ok: false, text: "変更に失敗しました。時間をおいて再度お試しください。" });
      return;
    }
    setPw("");
    setPw2("");
    setMsg({ ok: true, text: "パスワードを変更しました。" });
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          新しいパスワード（6文字以上）
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          新しいパスワード（確認）
        </label>
        <input
          type="password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          autoComplete="new-password"
          className={inputCls}
        />
      </div>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
      >
        {loading ? "変更中…" : "パスワードを変更"}
      </button>
    </form>
  );
}

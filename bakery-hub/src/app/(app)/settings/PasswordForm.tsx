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
      setMsg({ ok: false, text: "パスワードは6文字以上にしてください" });
      return;
    }
    if (pw !== pw2) {
      setMsg({ ok: false, text: "パスワードが一致していません" });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) {
      setMsg({ ok: false, text: "変更できませんでした。少し待ってからもう一度どうぞ" });
      return;
    }
    setPw("");
    setPw2("");
    setMsg({ ok: true, text: "変更しました" });
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
        {loading ? "変更しています" : "パスワードを変更"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { createUser } from "./actions";

export default function PortalUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    fd.set("password", pw);
    fd.set("role", role);
    const res = await createUser(fd);
    setLoading(false);
    setMsg(res);
    if (res.ok) {
      setName("");
      setEmail("");
      setPw("");
      setRole("user");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ユーザー名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          placeholder="山田 太郎"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          placeholder="user@example.com"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          初期パスワード（6文字以上）
        </label>
        <input
          type="text"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="off"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          権限
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "user")}
          className={inputCls}
        >
          <option value="user">ユーザー</option>
          <option value="admin">管理者</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          管理者はユーザーの削除・権限変更ができます。
        </p>
      </div>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "追加しています" : "ユーザーを追加"}
      </button>
    </form>
  );
}

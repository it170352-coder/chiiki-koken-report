"use client";

import { useState, useTransition } from "react";
import { STORE_ROLE_LABELS, type StoreRole } from "@/lib/types";
import { createStaff, removeStaff, type StaffMember } from "./staffActions";

export default function StaffManager({
  initialMembers,
  available,
}: {
  initialMembers: StaffMember[];
  available: boolean;
}) {
  const [members, setMembers] = useState<StaffMember[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StoreRole>("staff");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none";

  if (!available) {
    return (
      <p className="text-sm text-gray-500">
        スタッフ追加機能の準備が未完了です（管理者キーが未設定）。
        設定が済むと、ここでスタッフの追加・削除ができるようになります。
      </p>
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email.trim() || !password) {
      setMsg({ ok: false, text: "メールアドレスとパスワードを入力してください。" });
      return;
    }
    if (password.length < 6) {
      setMsg({ ok: false, text: "パスワードは6文字以上にしてください。" });
      return;
    }
    const fd = new FormData();
    fd.set("email", email.trim());
    fd.set("password", password);
    fd.set("name", name.trim());
    fd.set("role", role);
    startTransition(async () => {
      const res = await createStaff(fd);
      if ("error" in res) {
        setMsg({ ok: false, text: res.error });
        return;
      }
      setMembers((prev) => [
        ...prev,
        { userId: `tmp-${Date.now()}`, email: email.trim(), role },
      ]);
      setEmail("");
      setPassword("");
      setName("");
      setRole("staff");
      setMsg({ ok: true, text: "スタッフを追加しました。" });
    });
  }

  function handleRemove(m: StaffMember) {
    if (!confirm(`${m.email} を削除します。よろしいですか？`)) return;
    setMsg(null);
    startTransition(async () => {
      const res = await removeStaff(m.userId);
      if ("error" in res) {
        setMsg({ ok: false, text: res.error });
        return;
      }
      setMembers((prev) => prev.filter((x) => x.userId !== m.userId));
      setMsg({ ok: true, text: "スタッフを削除しました。" });
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-sm text-gray-400">まだスタッフがいません。</p>
        ) : (
          members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-700">{m.email}</p>
                <p className="text-xs text-gray-400">{STORE_ROLE_LABELS[m.role]}</p>
              </div>
              {m.role === "owner" ? (
                <span className="text-xs text-gray-400">削除不可</span>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleRemove(m)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  削除
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="space-y-3 border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700">スタッフを追加</p>
        <div>
          <label className="mb-1 block text-xs text-gray-500">お名前（任意）</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：高槻 花子"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            placeholder="staff@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">
            初期パスワード（6文字以上）
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            placeholder="本人に伝えるパスワード"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">権限</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StoreRole)}
            className={inputCls}
          >
            <option value="staff">スタッフ</option>
            <option value="manager">店長</option>
          </select>
        </div>
        {msg && (
          <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-500"}`}>
            {msg.text}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
        >
          {pending ? "処理中…" : "スタッフを追加"}
        </button>
      </form>
    </div>
  );
}

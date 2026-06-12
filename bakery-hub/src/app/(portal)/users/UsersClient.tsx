"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUser, deleteUser } from "./actions";

export type PortalUser = {
  id: string;
  name: string;
  displayName: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
};

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function UsersClient({
  users,
  currentUserId,
  isAdmin,
  hasError,
}: {
  users: PortalUser[];
  currentUserId: string;
  isAdmin: boolean;
  hasError: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<PortalUser | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">ユーザー一覧</h1>
        <p className="mt-1 text-sm text-gray-500">
          RaidQ Portal に登録されているユーザーです。追加は「設定」から行えます。
        </p>
      </div>

      {hasError ? (
        <p className="text-sm text-red-500">一覧を取得できませんでした。</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">ユーザー名</th>
                <th className="px-4 py-3 font-medium">メールアドレス</th>
                <th className="px-4 py-3 font-medium">権限</th>
                <th className="px-4 py-3 font-medium">登録日</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-500">
                        あなた
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(u)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditModal
          user={editing}
          isSelf={editing.id === currentUserId}
          isAdmin={isAdmin}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: "admin" | "user" }) {
  if (role === "admin") {
    return (
      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
        管理者
      </span>
    );
  }
  return (
    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
      ユーザー
    </span>
  );
}

function EditModal({
  user,
  isSelf,
  isAdmin,
  onClose,
  onDone,
}: {
  user: PortalUser;
  isSelf: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">(user.role);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    const fd = new FormData();
    fd.set("userId", user.id);
    fd.set("name", name);
    fd.set("email", email);
    fd.set("password", password);
    if (isAdmin) fd.set("role", role);
    startTransition(async () => {
      const res = await updateUser(fd);
      if ("error" in res) setError(res.error);
      else onDone();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteUser(user.id);
      if ("error" in res) setError(res.error);
      else onDone();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900">ユーザーを編集</h2>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-gray-500">ユーザー名</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="表示名"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-500">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-500">
              新しいパスワード（変更する場合のみ）
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none"
            />
          </label>

          {isAdmin ? (
            <label className="block">
              <span className="text-xs font-medium text-gray-500">権限</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "user")}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none"
              >
                <option value="user">ユーザー</option>
                <option value="admin">管理者</option>
              </select>
            </label>
          ) : (
            <div>
              <span className="text-xs font-medium text-gray-500">権限</span>
              <p className="mt-1 text-sm text-gray-700">
                <RoleBadge role={user.role} />
                <span className="ml-2 text-xs text-gray-400">
                  （権限の変更は管理者のみ）
                </span>
              </p>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {pending ? "保存中…" : "保存"}
          </button>
        </div>

        {isAdmin && !isSelf && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            {confirmDelete ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-red-500">本当に削除しますか？</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={pending}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    やめる
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={pending}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {pending ? "削除中…" : "削除する"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={pending}
                className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
              >
                このユーザーを削除
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

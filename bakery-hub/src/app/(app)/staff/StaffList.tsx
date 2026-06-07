"use client";

import { useState, useTransition } from "react";
import { STORE_ROLE_LABELS, type StoreRole } from "@/lib/types";
import { updateStaff, type StaffMember } from "../settings/staffActions";

const ROLE_BADGE: Record<StoreRole, string> = {
  owner: "bg-bark-100 text-bark-800",
  manager: "bg-blue-100 text-blue-700",
  employee: "bg-green-100 text-green-700",
  parttime: "bg-gray-100 text-gray-600",
};

function EditModal({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateStaff(fd);
      if ("error" in res) { setError(res.error); return; }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 font-semibold text-bark-900">スタッフを編集</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="userId" value={member.userId} />

          <div>
            <label className="mb-1 block text-xs text-gray-500">お名前</label>
            <input
              name="name"
              defaultValue={member.name}
              placeholder="例：高槻 花子"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">メールアドレス</label>
            <input
              type="email"
              name="email"
              defaultValue={member.email}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">権限</label>
            <select
              name="role"
              defaultValue={member.role}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            >
              <option value="owner">オーナー</option>
              <option value="manager">店長</option>
              <option value="employee">社員</option>
              <option value="parttime">アルバイト</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-bark-600 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
            >
              {pending ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffList({ members }: { members: StaffMember[] }) {
  const [editing, setEditing] = useState<StaffMember | null>(null);

  if (members.length === 0) {
    return <p className="text-sm text-gray-400">スタッフが登録されていません。</p>;
  }

  return (
    <>
      {editing && <EditModal member={editing} onClose={() => setEditing(null)} />}
      <p className="mb-3 text-sm text-gray-400">{members.length} 名登録中</p>
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center justify-between rounded-xl border border-bark-50 px-4 py-3">
            <div>
              {m.name && <p className="text-sm font-medium text-gray-800">{m.name}</p>}
              <p className={`text-sm ${m.name ? "text-gray-400" : "font-medium text-gray-800"}`}>{m.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[m.role]}`}>
                {STORE_ROLE_LABELS[m.role]}
              </span>
              <button
                onClick={() => setEditing(m)}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50"
              >
                編集
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

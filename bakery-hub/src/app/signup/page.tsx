"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "../login/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 text-gray-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-gray-900">RaidQ</span>
          <span className="rounded bg-indigo-600 px-2 py-0.5 text-sm font-semibold text-white">Portal</span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold text-gray-900">新規登録</h1>
            <p className="mt-1 text-sm text-gray-500">アカウントを作成して利用を開始</p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                店舗・組織名
              </label>
              <input
                type="text"
                name="store_name"
                required
                placeholder="〇〇株式会社"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                パスワード（6文字以上）
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending ? "登録中..." : "新規登録"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            すでにアカウントをお持ちの場合は{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              ログイン
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          株式会社レイドキュー
        </p>
      </div>
    </div>
  );
}

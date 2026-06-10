"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 text-gray-900">
      {/* 背景のグラデーション装飾 */}
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
            <h1 className="text-lg font-semibold text-gray-900">ログイン</h1>
            <p className="mt-1 text-sm text-gray-500">業務改善SaaSプラットフォーム</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-4">
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
                パスワード
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {pending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
              )}
              {pending ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            アカウントがない場合は{" "}
            <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
              新規登録
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

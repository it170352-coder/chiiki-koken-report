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

  if (pending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bark-50">
        <div className="flex flex-col items-center gap-6">
          {/* オーブン本体 */}
          <div className="relative">
            <div className="flex h-24 w-32 flex-col items-center justify-center rounded-2xl border-4 border-bark-700 bg-bark-800 shadow-xl">
              {/* オーブン窓 */}
              <div className="flex h-14 w-24 items-center justify-center rounded-xl border-2 border-bark-600 bg-bark-900">
                {/* パンのアニメーション */}
                <div
                  className="text-4xl"
                  style={{
                    animation: "breadBounce 1.2s ease-in-out infinite",
                  }}
                >
                  🍞
                </div>
              </div>
            </div>
            {/* 熱気エフェクト */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 0.3, 0.6].map((delay, i) => (
                <div
                  key={i}
                  className="h-4 w-1 rounded-full bg-amber-300 opacity-70"
                  style={{
                    animation: `steam 1.4s ease-in-out ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* ドットローダー */}
          <div className="flex gap-2">
            {[0, 0.2, 0.4].map((delay, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-bark-500"
                style={{
                  animation: `dotPulse 1.2s ease-in-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>

          <p className="text-sm font-medium text-bark-700">焼きたてを準備中...</p>
        </div>

        <style>{`
          @keyframes breadBounce {
            0%, 100% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-6px) rotate(5deg); }
          }
          @keyframes steam {
            0% { transform: translateY(0); opacity: 0.7; }
            100% { transform: translateY(-16px); opacity: 0; }
          }
          @keyframes dotPulse {
            0%, 100% { transform: scale(0.8); opacity: 0.4; }
            50% { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bark-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-bark-900">Bakery Hub</h1>
          <p className="mt-1 text-sm text-gray-500">パン屋さんの業務管理</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-bark-600 py-2 text-sm font-semibold text-white hover:bg-bark-700 disabled:opacity-50"
          >
            ログイン
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          アカウントがない場合は{" "}
          <Link href="/signup" className="font-medium text-bark-700 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}

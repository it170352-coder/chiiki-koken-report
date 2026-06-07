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
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bark-50">
        {/* トースター */}
        <div className="relative" style={{ width: 120, height: 140 }}>

          {/* パン（飛び出す） */}
          <div
            className="absolute left-1/2"
            style={{
              bottom: 52,
              width: 54,
              marginLeft: -27,
              animation: "breadPop 3.2s cubic-bezier(0.34,1.56,0.64,1) infinite",
              zIndex: 0,
            }}
          >
            {/* パン本体 */}
            <div style={{
              width: 54,
              height: 58,
              background: "linear-gradient(160deg, #f0c07a 20%, #d4862e 100%)",
              borderRadius: "14px 14px 6px 6px",
              position: "relative",
              boxShadow: "0 2px 8px rgba(180,100,20,0.25), inset -2px -3px 6px rgba(0,0,0,0.1)",
            }}>
              {/* ほっぺ（赤み） */}
              <div style={{ position:"absolute", left:7, top:28, width:10, height:7, borderRadius:"50%", background:"rgba(240,140,100,0.45)" }} />
              <div style={{ position:"absolute", right:7, top:28, width:10, height:7, borderRadius:"50%", background:"rgba(240,140,100,0.45)" }} />
              {/* 目（左） */}
              <div style={{ position:"absolute", left:14, top:18, width:7, height:8, borderRadius:"50%", background:"#5a3310" }} />
              <div style={{ position:"absolute", left:16, top:19, width:2, height:2, borderRadius:"50%", background:"white" }} />
              {/* 目（右） */}
              <div style={{ position:"absolute", right:14, top:18, width:7, height:8, borderRadius:"50%", background:"#5a3310" }} />
              <div style={{ position:"absolute", right:16, top:19, width:2, height:2, borderRadius:"50%", background:"white" }} />
              {/* 口（にっこり） */}
              <div style={{
                position:"absolute", left:"50%", top:30, transform:"translateX(-50%)",
                width:16, height:8,
                borderRadius:"0 0 10px 10px",
                border:"2.5px solid #5a3310",
                borderTop:"none",
              }} />
            </div>
            {/* 湯気 */}
            {[0, 0.4, 0.8].map((delay, i) => (
              <div key={i} style={{
                position: "absolute",
                bottom: "100%",
                left: `${18 + i * 18}%`,
                width: 5,
                height: 14,
                borderRadius: 9999,
                background: "rgba(220,180,120,0.55)",
                animation: `steam 1s ease-out ${delay}s infinite`,
              }} />
            ))}
          </div>

          {/* トースター本体 */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 120,
            height: 88,
            background: "linear-gradient(170deg, #faf8f4 60%, #e8e2da 100%)",
            borderRadius: 20,
            boxShadow: "0 6px 20px rgba(0,0,0,0.11), inset 0 1px 2px rgba(255,255,255,0.9)",
            zIndex: 1,
          }}>
            {/* スロット */}
            <div style={{
              position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
              width: 58, height: 11,
              background: "#c8b8a4",
              borderRadius: 6,
              boxShadow: "inset 0 3px 5px rgba(0,0,0,0.25)",
            }} />
            {/* レバー */}
            <div style={{
              position: "absolute", right: 14, top: 20,
              width: 9, height: 26,
              background: "linear-gradient(180deg,#d8d0c8,#b8b0a8)",
              borderRadius: 5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
            }} />
            {/* 足 */}
            {[18, 90].map((x, i) => (
              <div key={i} style={{
                position:"absolute", bottom:-7, left:x,
                width:12, height:8,
                background:"#d8d0c8",
                borderRadius:"0 0 6px 6px",
              }} />
            ))}
          </div>
        </div>

        <p className="text-sm font-medium text-bark-700" style={{ animation: "textBounce 3.2s ease-in-out infinite" }}>
          🍞 焼きたてを準備中...
        </p>

        <style>{`
          @keyframes breadPop {
            0%   { transform: translateY(32px) rotate(0deg); opacity: 0; }
            10%  { transform: translateY(32px) rotate(0deg); opacity: 0; }
            28%  { transform: translateY(-24px) rotate(-5deg); opacity: 1; }
            36%  { transform: translateY(-14px) rotate(4deg); opacity: 1; }
            44%  { transform: translateY(-22px) rotate(-3deg); opacity: 1; }
            52%  { transform: translateY(-13px) rotate(3deg); opacity: 1; }
            60%  { transform: translateY(-20px) rotate(-2deg); opacity: 1; }
            68%  { transform: translateY(-15px) rotate(1deg); opacity: 1; }
            76%  { transform: translateY(-19px) rotate(0deg); opacity: 1; }
            88%  { transform: translateY(-19px) rotate(0deg); opacity: 1; }
            97%  { transform: translateY(32px) rotate(0deg); opacity: 0; }
            100% { transform: translateY(32px) rotate(0deg); opacity: 0; }
          }
          @keyframes steam {
            0%   { transform: translateY(0) scaleX(1); opacity: 0.7; }
            50%  { transform: translateY(-10px) scaleX(1.3); opacity: 0.4; }
            100% { transform: translateY(-22px) scaleX(0.8); opacity: 0; }
          }
          @keyframes textBounce {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-3px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const floatingItems = [
    { emoji: "🍞", x: 8, delay: 0, duration: 7 },
    { emoji: "🥐", x: 20, delay: 1.5, duration: 9 },
    { emoji: "🧁", x: 75, delay: 0.8, duration: 8 },
    { emoji: "🍩", x: 88, delay: 2.5, duration: 6.5 },
    { emoji: "🥖", x: 50, delay: 3.5, duration: 10 },
    { emoji: "🍪", x: 62, delay: 1, duration: 7.5 },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bark-50 px-4">

      {/* 背景に漂うパン */}
      {floatingItems.map((item, i) => (
        <div
          key={i}
          className="pointer-events-none absolute select-none text-3xl opacity-20"
          style={{
            left: `${item.x}%`,
            bottom: "-60px",
            animation: `floatUp ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
        >
          {item.emoji}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-sm">
        {/* カード上部のイラスト */}
        <div className="mb-4 flex justify-center">
          <div className="relative" style={{ width: 80, height: 86 }}>
            {/* パン */}
            <div className="absolute left-1/2" style={{ bottom: 34, marginLeft: -18, width: 36, zIndex: 0, animation: "miniPop 3s ease-in-out infinite" }}>
              <div style={{ width: 36, height: 38, background: "linear-gradient(160deg,#f0c07a 20%,#d4862e 100%)", borderRadius: "10px 10px 4px 4px", position: "relative" }}>
                <div style={{ position:"absolute", left:9, top:12, width:5, height:6, borderRadius:"50%", background:"#5a3310" }} />
                <div style={{ position:"absolute", right:9, top:12, width:5, height:6, borderRadius:"50%", background:"#5a3310" }} />
                <div style={{ position:"absolute", left:"50%", top:21, transform:"translateX(-50%)", width:11, height:5, borderRadius:"0 0 7px 7px", border:"2px solid #5a3310", borderTop:"none" }} />
              </div>
            </div>
            {/* トースター */}
            <div style={{ position:"absolute", bottom:0, left:0, width:80, height:58, background:"linear-gradient(170deg,#faf8f4 60%,#e8e2da 100%)", borderRadius:14, boxShadow:"0 4px 14px rgba(0,0,0,0.1)", zIndex:1 }}>
              <div style={{ position:"absolute", top:9, left:"50%", transform:"translateX(-50%)", width:38, height:7, background:"#c8b8a4", borderRadius:4, boxShadow:"inset 0 2px 3px rgba(0,0,0,0.2)" }} />
              <div style={{ position:"absolute", right:9, top:13, width:6, height:17, background:"linear-gradient(180deg,#d8d0c8,#b8b0a8)", borderRadius:3 }} />
              <div style={{ position:"absolute", bottom:-5, left:12, width:8, height:6, background:"#d8d0c8", borderRadius:"0 0 5px 5px" }} />
              <div style={{ position:"absolute", bottom:-5, right:12, width:8, height:6, background:"#d8d0c8", borderRadius:"0 0 5px 5px" }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-md ring-1 ring-bark-100">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-bark-900">Bakery Hub</h1>
            <p className="mt-1 text-sm text-gray-400">パン屋さんの業務管理</p>
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

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(-8deg); opacity: 0; }
          10%  { opacity: 0.2; }
          50%  { transform: translateY(-45vh) rotate(8deg); opacity: 0.18; }
          90%  { opacity: 0.1; }
          100% { transform: translateY(-100vh) rotate(-4deg); opacity: 0; }
        }
        @keyframes miniPop {
          0%, 100% { transform: translateY(4px); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

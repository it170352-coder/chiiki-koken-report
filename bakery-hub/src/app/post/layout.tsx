"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/post", label: "ダッシュボード" },
  { href: "/post/clients", label: "クライアント" },
  { href: "/post/posts", label: "投稿管理" },
  { href: "/post/research", label: "情報収集" },
  { href: "/post/competitors", label: "競合分析" },
  { href: "/post/knowledge", label: "ナレッジ" },
  { href: "/post/report", label: "月次レポート" },
];

export default function PostHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/post") return pathname === "/post";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gray-50 text-gray-900">
      {/* サイドバー（PC） */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50 px-3 py-5 md:flex">
        <div className="px-3 mb-6">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            RaidQ Portal
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">Post Hub</span>
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">SNS</span>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(l.href)
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ヘッダー（スマホ） */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Post Hub</span>
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">SNS</span>
          </div>
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-0.5 border-t border-gray-200 px-4 py-2">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(l.href) ? "bg-gray-100 text-gray-900" : "text-gray-600"
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>

      {/* 投稿作成へのショートカット（下部中央の＋ボタン） */}
      {pathname !== "/post/posts/new" && (
        <Link
          href="/post/posts/new"
          aria-label="投稿を作成"
          className="fixed bottom-6 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      )}
    </div>
  );
}

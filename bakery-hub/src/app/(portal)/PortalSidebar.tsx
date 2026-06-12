"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/login/actions";

const NAV = [
  { href: "/", label: "アプリ一覧", icon: "▦" },
  { href: "/roadmap", label: "実装予定", icon: "🗓" },
  { href: "/users", label: "ユーザー一覧", icon: "👤" },
  { href: "/settings", label: "設定", icon: "⚙" },
];

export default function PortalSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const navLinks = (onClick?: () => void) =>
    NAV.map((l) => (
      <Link
        key={l.href}
        href={l.href}
        onClick={onClick}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive(l.href)
            ? "bg-indigo-50 text-indigo-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <span className="text-base">{l.icon}</span>
        {l.label}
      </Link>
    ));

  return (
    <>
      {/* サイドバー（PC） */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-5 md:flex">
        <div className="px-3 mb-6 flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-gray-900">RaidQ</span>
          <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">Portal</span>
        </div>
        <nav className="flex flex-col gap-0.5">{navLinks()}</nav>
        <div className="mt-auto border-t border-gray-100 pt-3">
          {email && <p className="px-3 pb-2 text-xs text-gray-400 truncate">{email}</p>}
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <span className="text-base">⏻</span>
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      {/* ヘッダー（スマホ） */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-gray-900">RaidQ</span>
            <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs text-white">Portal</span>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="メニュー"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-0.5 border-t border-gray-200 px-4 py-2">
            {navLinks(() => setOpen(false))}
            {email && <p className="px-3 pt-2 text-xs text-gray-400 truncate">{email}</p>}
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <span>⏻</span>ログアウト
              </button>
            </form>
          </nav>
        )}
      </header>
    </>
  );
}

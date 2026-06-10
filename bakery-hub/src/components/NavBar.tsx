"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/login/actions";

export default function NavBar({ storeName, customerMode, showAnalytics = true }: { storeName: string; customerMode?: string; showAnalytics?: boolean }) {
  const isCorporate = customerMode === "corporate";
  const BASE = "/bakery";
  const LINKS = [
    { href: `${BASE}`, label: "ダッシュボード" },
    { href: `${BASE}/reservations`, label: isCorporate ? "注文" : "予約" },
    { href: `${BASE}/customers`, label: isCorporate ? "取引先" : "顧客" },
    { href: `${BASE}/products`, label: "商品・在庫" },
    { href: `${BASE}/visitors`, label: "来客数" },
    ...(showAnalytics ? [{ href: `${BASE}/analytics`, label: "分析" }] : []),
    { href: `${BASE}/staff`, label: "シフト管理" },
    { href: `${BASE}/knead`, label: "案をこねる" },
    { href: `${BASE}/settings`, label: "設定" },
  ];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    if (href === BASE) return pathname === BASE || pathname === `${BASE}/`;
    if (href === `${BASE}/products`) return pathname.startsWith(`${BASE}/products`) || pathname.startsWith(`${BASE}/inventory`) || pathname.startsWith(`${BASE}/ingredients`);
    return pathname.startsWith(href);
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive(l.href)
                ? "bg-bark-100 text-bark-900"
                : "text-gray-600 hover:bg-bark-50"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <form action={logout} className="mt-1">
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-400 hover:bg-bark-50 hover:text-gray-600">
            ログアウト
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      {/* タブレット以上：左サイドメニュー */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-bark-100 bg-white px-3 py-5 md:flex">
        <div className="px-3">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            RaidQ Portal
          </Link>
          <span className="text-lg font-bold text-bark-900">Bakery Hub</span>
          {storeName && (
            <p className="mt-0.5 text-xs text-gray-400">{storeName}</p>
          )}
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          <NavLinks />
        </nav>
      </aside>

      {/* スマホ：上部バー＋ハンバーガー */}
      <header className="sticky top-0 z-20 border-b border-bark-100 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-bark-900">Bakery Hub</span>
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-bark-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="メニュー"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-bark-100 px-4 py-2">
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
        )}
      </header>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

type Post = {
  id: string;
  title: string;
  status: string;
  platform: string;
  scheduled_at: string | null;
  client_id: string | null;
  post_clients: { name: string } | { name: string }[] | null;
};

type Client = { id: string; name: string };

const STATUS_LABEL: Record<string, string> = {
  idea: "ネタ", planning: "企画中", writing: "作成中", review: "確認中", posted: "投稿済",
};
const STATUS_COLOR: Record<string, string> = {
  idea: "bg-gray-200 text-gray-700",
  planning: "bg-yellow-100 text-yellow-700",
  writing: "bg-blue-100 text-blue-700",
  review: "bg-purple-100 text-purple-700",
  posted: "bg-green-100 text-green-700",
};
const STATUS_DOT: Record<string, string> = {
  idea: "bg-gray-400",
  planning: "bg-yellow-400",
  writing: "bg-blue-400",
  review: "bg-purple-400",
  posted: "bg-green-400",
};
const STATUS_ORDER = ["idea", "planning", "writing", "review", "posted"];
const PLATFORM_COLOR: Record<string, string> = {
  threads: "bg-gray-800 text-white",
  x: "bg-black text-white",
  instagram: "bg-pink-500 text-white",
  facebook: "bg-blue-600 text-white",
};

type ViewMode = "kanban" | "month" | "week";

function clientName(post_clients: Post["post_clients"]): string {
  if (!post_clients) return "";
  if (Array.isArray(post_clients)) return post_clients[0]?.name ?? "";
  return post_clients.name;
}

// ── カンバンビュー ─────────────────────────────────────────
function KanbanView({ posts }: { posts: Post[] }) {
  const grouped = STATUS_ORDER.reduce<Record<string, Post[]>>((acc, s) => {
    acc[s] = posts.filter((p) => p.status === s);
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
      <div className="flex gap-3 min-w-[680px] md:min-w-0 md:grid md:grid-cols-3 lg:grid-cols-5">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="w-44 shrink-0 md:w-auto space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[status]}`}>
                {STATUS_LABEL[status]}
              </span>
              <span className="text-xs text-gray-400">{grouped[status].length}</span>
            </div>
            <div className="space-y-2 min-h-16">
              {grouped[status].map((p) => (
                <Link key={p.id} href={`/post/posts/${p.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 active:bg-gray-50 transition-colors">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2">{p.title}</p>
                  {p.post_clients && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{clientName(p.post_clients)}</p>
                  )}
                  <div className="flex items-center justify-between mt-2 gap-1">
                    <span className={`rounded px-1.5 py-0.5 text-xs shrink-0 ${PLATFORM_COLOR[p.platform] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.platform}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {p.scheduled_at ? p.scheduled_at.slice(5, 10) : "-"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 月表示 ─────────────────────────────────────────────────
function MonthView({ posts, year, month }: { posts: Post[]; year: number; month: number }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const postsByDate: Record<string, Post[]> = {};
  for (const p of posts) {
    if (!p.scheduled_at) continue;
    const key = p.scheduled_at.slice(0, 10);
    if (!postsByDate[key]) postsByDate[key] = [];
    postsByDate[key].push(p);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="min-w-[320px]">
        <div className="grid grid-cols-7 border-l border-t border-gray-200 rounded-t overflow-hidden">
          {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
            <div key={d} className={`border-b border-r border-gray-200 py-2 text-center text-xs font-medium ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
            }`}>
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            const dateKey = day
              ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              : "";
            const dayPosts = dateKey ? (postsByDate[dateKey] ?? []) : [];
            const isToday = dateKey === todayKey;
            const dow = i % 7;

            return (
              <div key={i} className={`border-b border-r border-gray-200 p-1 min-h-[60px] sm:min-h-20 md:min-h-24 ${
                !day ? "bg-gray-50" : "bg-white"
              }`}>
                {day && (
                  <>
                    <span className={`text-xs font-medium inline-flex h-5 w-5 items-center justify-center rounded-full ${
                      isToday ? "bg-blue-600 text-white" : dow === 0 ? "text-red-500" : dow === 6 ? "text-blue-500" : "text-gray-700"
                    }`}>
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap gap-0.5 sm:hidden">
                        {dayPosts.slice(0, 4).map((p) => (
                          <span key={p.id} className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[p.status]}`} />
                        ))}
                        {dayPosts.length > 4 && (
                          <span className="text-[9px] text-gray-400">+{dayPosts.length - 4}</span>
                        )}
                      </div>
                    )}
                    <div className="mt-0.5 space-y-0.5 hidden sm:block">
                      {dayPosts.slice(0, 2).map((p) => (
                        <Link key={p.id} href={`/post/posts/${p.id}`}
                          className={`block truncate rounded px-1 py-0.5 text-[10px] md:text-xs ${STATUS_COLOR[p.status]}`}>
                          {p.title}
                        </Link>
                      ))}
                      {dayPosts.slice(2, 3).map((p) => (
                        <Link key={p.id} href={`/post/posts/${p.id}`}
                          className={`hidden md:block truncate rounded px-1 py-0.5 text-xs ${STATUS_COLOR[p.status]}`}>
                          {p.title}
                        </Link>
                      ))}
                      {dayPosts.length > 2 && (
                        <span className="text-[10px] text-gray-400 pl-1 hidden sm:block md:hidden">
                          +{dayPosts.length - 2}
                        </span>
                      )}
                      {dayPosts.length > 3 && (
                        <span className="text-xs text-gray-400 pl-1 hidden md:block">
                          +{dayPosts.length - 3}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 週表示 ─────────────────────────────────────────────────
function WeekView({ posts, weekStart }: { posts: Post[]; weekStart: Date }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const postsByDate: Record<string, Post[]> = {};
  for (const p of posts) {
    if (!p.scheduled_at) continue;
    const key = p.scheduled_at.slice(0, 10);
    if (!postsByDate[key]) postsByDate[key] = [];
    postsByDate[key].push(p);
  }

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2">
      <div className="grid grid-cols-7 border-l border-t border-gray-200 rounded overflow-hidden min-w-[560px] md:min-w-0">
        {days.map((d, i) => {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const dayPosts = postsByDate[key] ?? [];
          const isToday = key === todayKey;

          return (
            <div key={i} className="border-b border-r border-gray-200">
              <div className={`py-2 text-center border-b border-gray-100 ${isToday ? "bg-blue-50" : ""}`}>
                <p className={`text-[10px] font-medium sm:text-xs ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>
                  {["日", "月", "火", "水", "木", "金", "土"][i]}
                </p>
                <span className={`text-xs sm:text-sm font-bold inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full ${
                  isToday ? "bg-blue-600 text-white" : i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-800"
                }`}>
                  {d.getDate()}
                </span>
              </div>
              <div className="min-h-28 sm:min-h-36 p-1 space-y-1">
                {dayPosts.map((p) => (
                  <Link key={p.id} href={`/post/posts/${p.id}`}
                    className={`block rounded px-1 sm:px-1.5 py-1 text-[10px] sm:text-xs ${STATUS_COLOR[p.status]} hover:opacity-80 active:opacity-60`}>
                    <p className="font-medium line-clamp-2">{p.title}</p>
                    {p.post_clients && (
                      <p className="opacity-70 mt-0.5 truncate hidden sm:block">
                        {clientName(p.post_clients)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── クライアントフィルター ──────────────────────────────────
function ClientFilter({
  clients,
  selected,
  onChange,
}: {
  clients: Client[];
  selected: string | null;
  onChange: (id: string | null) => void;
}) {
  if (clients.length === 0) return null;
  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
      <div className="flex gap-1.5 min-w-max">
        <button
          onClick={() => onChange(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
            selected === null
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          すべて
        </button>
        {clients.map((c) => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              selected === c.id
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── メインコンポーネント ────────────────────────────────────
export default function PostsClient({
  posts,
  clients,
}: {
  posts: Post[];
  clients: Client[];
}) {
  const today = new Date();
  const [view, setView] = useState<ViewMode>("kanban");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const weekStartDate = new Date(today);
  weekStartDate.setDate(today.getDate() - today.getDay());
  const [weekStart, setWeekStart] = useState(weekStartDate);

  const filteredPosts = selectedClient
    ? posts.filter((p) => p.client_id === selectedClient)
    : posts;

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }
  function prevWeek() {
    const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d);
  }
  function nextWeek() {
    const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    const ws = new Date(today);
    ws.setDate(today.getDate() - today.getDay());
    setWeekStart(ws);
  }

  const MONTH_NAMES = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  const weekLabel = `${weekStart.getMonth()+1}/${weekStart.getDate()} — ${weekEnd.getMonth()+1}/${weekEnd.getDate()}`;

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">投稿管理</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden sm:block">Threads / X の投稿を管理・進捗追跡</p>
        </div>
        <Link href="/post/posts/new"
          className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 sm:px-4 text-sm font-medium text-white hover:bg-blue-500 active:bg-blue-700 transition-colors">
          + 追加
        </Link>
      </div>

      {/* クライアントフィルター */}
      <ClientFilter
        clients={clients}
        selected={selectedClient}
        onChange={setSelectedClient}
      />

      {/* ツールバー */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          {(["kanban", "month", "week"] as ViewMode[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`rounded-md px-2.5 py-1 text-xs sm:text-sm font-medium transition-colors ${
                view === v ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}>
              {v === "kanban" ? "カンバン" : v === "month" ? "月" : "週"}
            </button>
          ))}
        </div>

        {/* 絞り込み中バッジ */}
        {selectedClient && (
          <span className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs text-blue-700">
            {clients.find((c) => c.id === selectedClient)?.name}
            <button onClick={() => setSelectedClient(null)} className="hover:text-blue-900 ml-0.5">×</button>
          </span>
        )}

        {(view === "month" || view === "week") && (
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={view === "month" ? prevMonth : prevWeek}
              className="rounded-lg p-1.5 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button onClick={goToday}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              今日
            </button>
            <span className="text-xs sm:text-sm font-medium text-gray-900 min-w-[80px] sm:min-w-24 text-center select-none">
              {view === "month" ? `${year}年 ${MONTH_NAMES[month]}` : weekLabel}
            </span>
            <button onClick={view === "month" ? nextMonth : nextWeek}
              className="rounded-lg p-1.5 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ビュー本体 */}
      {view === "kanban" && <KanbanView posts={filteredPosts} />}
      {view === "month" && <MonthView posts={filteredPosts} year={year} month={month} />}
      {view === "week" && <WeekView posts={filteredPosts} weekStart={weekStart} />}
    </div>
  );
}

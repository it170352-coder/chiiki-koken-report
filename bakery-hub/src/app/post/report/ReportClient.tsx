"use client";

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

const STATUS_ORDER = ["idea", "planning", "writing", "review", "posted"] as const;
const STATUS_LABEL: Record<string, string> = {
  idea: "ネタ", planning: "企画中", writing: "作成中", review: "確認中", posted: "投稿済",
};
const STATUS_COLOR: Record<string, string> = {
  idea: "bg-gray-100 text-gray-600",
  planning: "bg-yellow-50 text-yellow-700",
  writing: "bg-blue-50 text-blue-700",
  review: "bg-purple-50 text-purple-700",
  posted: "bg-green-50 text-green-700",
};
const PLATFORM_LABEL: Record<string, string> = {
  threads: "Threads", x: "X", instagram: "Instagram", facebook: "Facebook",
};

function clientName(post_clients: Post["post_clients"]): string {
  if (!post_clients) return "未設定";
  if (Array.isArray(post_clients)) return post_clients[0]?.name ?? "未設定";
  return post_clients.name;
}

function getMonthKey(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return dateStr.slice(0, 7); // "YYYY-MM"
}

export default function ReportClient({
  posts,
  clients,
}: {
  posts: Post[];
  clients: Client[];
}) {
  const today = new Date();

  // 存在する月キー一覧を抽出
  const monthKeys = Array.from(
    new Set(
      posts
        .map((p) => getMonthKey(p.scheduled_at))
        .filter((k): k is string => k !== null)
    )
  ).sort((a, b) => b.localeCompare(a)); // 新しい順

  // 当月またはデータがある最新月をデフォルト
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const defaultMonth = monthKeys.includes(currentMonthKey) ? currentMonthKey : (monthKeys[0] ?? currentMonthKey);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // 選択月の投稿
  const monthPosts = posts.filter((p) => getMonthKey(p.scheduled_at) === selectedMonth);

  // KPIサマリー
  const totalPosts = monthPosts.length;
  const postedCount = monthPosts.filter((p) => p.status === "posted").length;
  const inProgressCount = monthPosts.filter((p) => ["planning", "writing", "review"].includes(p.status)).length;
  const completionRate = totalPosts > 0 ? Math.round((postedCount / totalPosts) * 100) : 0;

  // クライアント別集計
  const clientMap: Record<string, { name: string; counts: Record<string, number>; total: number }> = {};
  for (const p of monthPosts) {
    const key = p.client_id ?? "__none__";
    const name = clientName(p.post_clients);
    if (!clientMap[key]) clientMap[key] = { name, counts: {}, total: 0 };
    clientMap[key].counts[p.status] = (clientMap[key].counts[p.status] ?? 0) + 1;
    clientMap[key].total += 1;
  }
  const clientRows = Object.values(clientMap).sort((a, b) => b.total - a.total);

  // プラットフォーム別集計
  const platformMap: Record<string, number> = {};
  for (const p of monthPosts) {
    platformMap[p.platform] = (platformMap[p.platform] ?? 0) + 1;
  }
  const platformRows = Object.entries(platformMap).sort((a, b) => b[1] - a[1]);

  // 月ラベル整形
  function formatMonthLabel(key: string) {
    const [y, m] = key.split("-");
    return `${y}年${parseInt(m)}月`;
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">月次レポート</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden sm:block">クライアントごとの投稿進捗・実績を確認</p>
        </div>
        {/* 月選択 */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {monthKeys.length === 0 && (
            <option value={currentMonthKey}>{formatMonthLabel(currentMonthKey)}</option>
          )}
          {monthKeys.map((k) => (
            <option key={k} value={k}>{formatMonthLabel(k)}</option>
          ))}
        </select>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "合計投稿数", value: totalPosts, sub: "件" },
          { label: "投稿済", value: postedCount, sub: "件", color: "text-green-600" },
          { label: "進行中", value: inProgressCount, sub: "件", color: "text-blue-600" },
          { label: "完了率", value: completionRate, sub: "%", color: completionRate >= 80 ? "text-green-600" : "text-yellow-600" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color ?? "text-gray-900"}`}>
              {card.value}<span className="text-sm font-normal text-gray-500 ml-0.5">{card.sub}</span>
            </p>
          </div>
        ))}
      </div>

      {monthPosts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500 text-sm">この月の投稿データがありません。</p>
        </div>
      ) : (
        <>
          {/* クライアント別テーブル */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">クライアント別集計</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 sm:px-5 py-2.5 text-xs font-medium text-gray-500">クライアント</th>
                    {STATUS_ORDER.map((s) => (
                      <th key={s} className="text-center px-2 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">
                        {STATUS_LABEL[s]}
                      </th>
                    ))}
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">合計</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500">完了率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientRows.map((row, i) => {
                    const posted = row.counts["posted"] ?? 0;
                    const rate = row.total > 0 ? Math.round((posted / row.total) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-5 py-3 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                        {STATUS_ORDER.map((s) => (
                          <td key={s} className="text-center px-2 py-3">
                            {(row.counts[s] ?? 0) > 0 ? (
                              <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLOR[s]}`}>
                                {row.counts[s]}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        ))}
                        <td className="text-center px-4 py-3 font-semibold text-gray-900">{row.total}</td>
                        <td className="text-center px-4 py-3">
                          <span className={`text-xs font-medium ${rate >= 80 ? "text-green-600" : rate >= 50 ? "text-yellow-600" : "text-gray-500"}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* 合計行 */}
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="px-4 sm:px-5 py-2.5 text-xs font-semibold text-gray-700">合計</td>
                    {STATUS_ORDER.map((s) => {
                      const total = clientRows.reduce((sum, r) => sum + (r.counts[s] ?? 0), 0);
                      return (
                        <td key={s} className="text-center px-2 py-2.5 text-xs font-semibold text-gray-700">
                          {total > 0 ? total : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                    <td className="text-center px-4 py-2.5 text-xs font-bold text-gray-900">{totalPosts}</td>
                    <td className="text-center px-4 py-2.5 text-xs font-semibold text-gray-700">{completionRate}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* プラットフォーム別 */}
          {platformRows.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">プラットフォーム別</h2>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                {platformRows.map(([platform, count]) => {
                  const pct = totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0;
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">{PLATFORM_LABEL[platform] ?? platform}</span>
                        <span className="text-sm font-medium text-gray-900">{count}件 <span className="text-xs text-gray-400">({pct}%)</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

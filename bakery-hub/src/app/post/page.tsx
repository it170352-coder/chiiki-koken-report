import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/server";

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
const STATUS_BAR: Record<string, string> = {
  idea: "bg-gray-400",
  planning: "bg-yellow-400",
  writing: "bg-blue-400",
  review: "bg-purple-400",
  posted: "bg-green-500",
};
const STATUS_ORDER = ["idea", "planning", "writing", "review", "posted"];

export default async function PostHubDashboard() {
  const { userId, storeId } = await getCurrentStore();
  if (!userId) redirect("/login");

  const supabase = await createClient();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  // 今日 〜 7日後
  const todayStr = now.toISOString().slice(0, 10);
  const in7days = new Date(now);
  in7days.setDate(now.getDate() + 6);
  const in7daysStr = in7days.toISOString().slice(0, 10);

  const [clientsRes, postsRes, researchRes, knowledgeRes, competitorsRes] = await Promise.all([
    supabase.from("post_clients").select("id, name, status").eq("store_id", storeId ?? ""),
    supabase
      .from("post_posts")
      .select("id, title, status, scheduled_at, platform, client_id, post_clients(name)")
      .eq("store_id", storeId ?? ""),
    supabase.from("post_research").select("id").eq("store_id", storeId ?? ""),
    supabase.from("post_knowledge").select("id").eq("store_id", storeId ?? ""),
    supabase.from("post_competitors").select("id").eq("store_id", storeId ?? ""),
  ]);

  const allClients = clientsRes.data ?? [];
  const allPosts = postsRes.data ?? [];
  const activeClients = allClients.filter((c) => c.status === "active");

  // 今月の集計
  const thisMonthPosts = allPosts.filter(
    (p) => p.scheduled_at && p.scheduled_at >= firstDay && p.scheduled_at <= lastDay
  );
  const postedCount = thisMonthPosts.filter((p) => p.status === "posted").length;
  const completionRate = thisMonthPosts.length > 0
    ? Math.round((postedCount / thisMonthPosts.length) * 100) : 0;

  // ステータス別件数
  const statusCounts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = thisMonthPosts.filter((p) => p.status === s).length;
    return acc;
  }, {});

  // 今週のスケジュール（今日〜7日後、未投稿）
  const weekPosts = allPosts
    .filter((p) => p.scheduled_at && p.scheduled_at >= todayStr && p.scheduled_at <= in7daysStr)
    .sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""));

  // クライアント別 今月集計
  const clientStats = activeClients.map((c) => {
    const cp = thisMonthPosts.filter((p) => p.client_id === c.id);
    const posted = cp.filter((p) => p.status === "posted").length;
    return { id: c.id, name: c.name, total: cp.length, posted };
  }).sort((a, b) => b.total - a.total);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}(${["日","月","火","水","木","金","土"][dt.getDay()]})`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ページタイトル */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Post Hub</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-gray-600">SNS運用業務プラットフォーム</p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="今月の投稿" value={String(thisMonthPosts.length)} sub="件（予定含む）" />
        <KpiCard label="投稿済" value={String(postedCount)} sub="件" color="text-green-600" />
        <KpiCard label="完了率" value={`${completionRate}%`} sub="今月" color={completionRate >= 80 ? "text-green-600" : "text-yellow-600"} />
        <KpiCard label="稼働クライアント" value={String(activeClients.length)} sub="社" color="text-blue-600" />
      </div>

      {/* ステータス分布 */}
      {thisMonthPosts.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">今月のステータス分布</h2>
          {/* バー */}
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            {STATUS_ORDER.map((s) => {
              const pct = thisMonthPosts.length > 0
                ? (statusCounts[s] / thisMonthPosts.length) * 100 : 0;
              return pct > 0 ? (
                <div key={s} className={`${STATUS_BAR[s]} transition-all`} style={{ width: `${pct}%` }} />
              ) : null;
            })}
          </div>
          {/* 凡例 */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {STATUS_ORDER.map((s) => (
              statusCounts[s] > 0 ? (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${STATUS_BAR[s]}`} />
                  <span className="text-xs text-gray-600">{STATUS_LABEL[s]}</span>
                  <span className="text-xs font-medium text-gray-900">{statusCounts[s]}</span>
                </div>
              ) : null
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 今週のスケジュール */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">今週のスケジュール</h2>
            <Link href="/post/posts?view=week" className="text-xs text-blue-600 hover:text-blue-800">週表示で見る →</Link>
          </div>
          {weekPosts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-sm text-gray-500">今週の予定投稿はありません</p>
              <Link href="/post/posts/new" className="mt-2 inline-block text-xs text-blue-600 hover:underline">
                投稿を追加する
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              {weekPosts.slice(0, 7).map((p) => {
                const name = p.post_clients
                  ? Array.isArray(p.post_clients)
                    ? p.post_clients[0]?.name
                    : (p.post_clients as { name: string }).name
                  : null;
                return (
                  <Link key={p.id} href={`/post/posts/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <span className="text-xs text-gray-500 w-[56px] shrink-0 font-medium">
                      {formatDate(p.scheduled_at!)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${STATUS_COLOR[p.status] ?? "bg-gray-200 text-gray-600"}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                    <span className="flex-1 text-xs sm:text-sm text-gray-900 truncate">{p.title}</span>
                    {name && <span className="text-xs text-gray-400 truncate hidden sm:block max-w-[80px]">{name}</span>}
                  </Link>
                );
              })}
              {weekPosts.length > 7 && (
                <div className="px-4 py-2 text-xs text-gray-400 text-center">他 {weekPosts.length - 7} 件</div>
              )}
            </div>
          )}
        </section>

        {/* クライアント別サマリー */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">クライアント別（今月）</h2>
            <Link href="/post/report" className="text-xs text-blue-600 hover:text-blue-800">詳細レポート →</Link>
          </div>
          {clientStats.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-sm text-gray-500">稼働中のクライアントがいません</p>
              <Link href="/post/clients/new" className="mt-2 inline-block text-xs text-blue-600 hover:underline">
                クライアントを追加する
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              {clientStats.map((c) => {
                const rate = c.total > 0 ? Math.round((c.posted / c.total) * 100) : 0;
                return (
                  <div key={c.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{c.name}</span>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                        {c.posted}/{c.total}件
                        <span className={`ml-1.5 font-medium ${rate >= 80 ? "text-green-600" : rate >= 50 ? "text-yellow-600" : "text-gray-500"}`}>
                          {rate}%
                        </span>
                      </span>
                    </div>
                    {c.total > 0 ? (
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">今月の投稿なし</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ショートカット */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">クイックアクセス</h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { href: "/post/clients", label: "クライアント", count: allClients.length, icon: "👥" },
            { href: "/post/posts", label: "投稿管理", count: allPosts.length, icon: "📝" },
            { href: "/post/research", label: "情報収集", count: (researchRes.data ?? []).length, icon: "🔍" },
            { href: "/post/competitors", label: "競合分析", count: (competitorsRes.data ?? []).length, icon: "📊" },
            { href: "/post/report", label: "月次レポート", count: null, icon: "📈" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 hover:border-gray-300 active:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.label}</p>
                {item.count !== null && (
                  <p className="text-xs text-gray-500">{item.count}件</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label, value, sub, color = "text-gray-900",
}: {
  label: string; value: string; sub: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
      <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{sub}</p>
      <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

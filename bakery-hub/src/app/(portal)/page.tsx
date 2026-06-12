import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type App = {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  href: string;
  description: string;
};

const APPS: App[] = [
  { slug: "bakery", name: "Bakery Hub", shortName: "Bakery", icon: "/app-icons/bakery.png", href: "/bakery", description: "ベーカリー管理" },
  { slug: "post",   name: "Post Hub",   shortName: "Post",   icon: "/app-icons/post.png",   href: "/post",   description: "SNS運用支援" },
];

function timeAgo(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = 60_000, h = 3_600_000, day = 86_400_000;
  if (diff < m) return "たった今";
  if (diff < h) return `${Math.floor(diff / m)}分前`;
  if (diff < day) return `${Math.floor(diff / h)}時間前`;
  if (diff < day * 30) return `${Math.floor(diff / day)}日前`;
  if (diff < day * 365) return `${Math.floor(diff / (day * 30))}ヶ月前`;
  return `${Math.floor(diff / (day * 365))}年前`;
}

function nameOf(u: { email?: string | null; user_metadata?: unknown }): string {
  const meta = u.user_metadata as { display_name?: string } | null;
  const dn = meta?.display_name?.trim();
  return dn || u.email?.split("@")[0] || "（名前未設定）";
}

export default async function PortalTop() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = user?.email?.split("@")[0] ?? "ゲスト";

  // ユーザー一覧（数 + 最新アクティビティに使用）
  let userCount: number | null = null;
  let recentUsers: { id: string; name: string; createdAt: string }[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    const all = data?.users ?? [];
    userCount = all.length;
    recentUsers = [...all]
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 5)
      .map((u) => ({ id: u.id, name: nameOf(u), createdAt: u.created_at ?? "" }));
  } catch {
    userCount = null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* グリーティング */}
        <p className="text-xs text-indigo-400 font-medium tracking-widest uppercase mb-1">RaidQ Portal</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          こんにちは、{displayName} さん
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">業務改善SaaSプラットフォーム</p>

        {/* Portal概要 + KPI */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <section className="sm:col-span-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Portal概要</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              RaidQ Portal は、店舗・SNS運用などの業務を支援するアプリをまとめた
              プラットフォームです。下のアイコンから各アプリを開けます。
            </p>
          </section>

          <KpiCard label="利用可能アプリ数" value={`${APPS.length}`} unit="アプリ" accent="indigo" />
          <KpiCard label="ユーザー数" value={userCount === null ? "—" : `${userCount}`} unit="人" accent="sky" />
          <KpiCard label="最新の参加" value={recentUsers[0] ? timeAgo(recentUsers[0].createdAt) : "—"} unit="" accent="emerald" />
        </div>

        {/* アプリランチャー */}
        <h2 className="mt-10 mb-4 text-sm font-semibold text-gray-900">アプリ</h2>
        <div className="flex flex-wrap gap-8 sm:gap-10">
          {APPS.map((app) => (
            <AppIcon key={app.slug} app={app} />
          ))}
        </div>

        {/* 最新アクティビティ */}
        <h2 className="mt-10 mb-4 text-sm font-semibold text-gray-900">最新アクティビティ</h2>
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {recentUsers.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">アクティビティはまだありません。</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                    {u.name.charAt(0)}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{u.name}</span> さんが参加しました
                  </p>
                  <span className="shrink-0 text-xs text-gray-400">{timeAgo(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({ label, value, unit, accent }: { label: string; value: string; unit: string; accent: "indigo" | "sky" | "emerald" }) {
  const dot = { indigo: "bg-indigo-400", sky: "bg-sky-400", emerald: "bg-emerald-400" }[accent];
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
        {unit && <span className="ml-1 text-base font-medium text-gray-400">{unit}</span>}
      </p>
    </div>
  );
}

function AppIcon({ app }: { app: App }) {
  return (
    <Link href={app.href} className="flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <img
          src={app.icon}
          alt={app.name}
          width={80}
          height={80}
          className="
            h-16 w-16 sm:h-20 sm:w-20
            rounded-[22px] sm:rounded-[26px]
            object-cover shadow-md
            transition-transform duration-150
            active:scale-90 hover:shadow-lg
          "
        />
        <div className="text-center">
          <p className="text-xs font-medium text-gray-800">{app.shortName}</p>
          <p className="text-[10px] mt-0.5 text-gray-500">{app.description}</p>
        </div>
      </div>
    </Link>
  );
}

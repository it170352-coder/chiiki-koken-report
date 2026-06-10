import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type App = {
  slug: string;
  name: string;
  shortName: string;
  emoji: string;
  status: "active" | "planned";
  gradient: string;
  href: string;
  description: string;
};

const APPS: App[] = [
  { slug: "bakery",  name: "Bakery Hub",  shortName: "Bakery",  emoji: "🍞", status: "active",  gradient: "from-amber-400 to-orange-500",   href: "/bakery", description: "ベーカリー管理" },
  { slug: "post",    name: "Post Hub",    shortName: "Post",    emoji: "📱", status: "active",  gradient: "from-sky-400 to-blue-600",        href: "/post",   description: "SNS運用支援" },
  { slug: "beauty",  name: "Beauty Hub",  shortName: "Beauty",  emoji: "💇", status: "planned", gradient: "from-pink-400 to-rose-500",       href: "#",       description: "美容院向け" },
  { slug: "pet",     name: "Pet Hub",     shortName: "Pet",     emoji: "🐾", status: "planned", gradient: "from-emerald-400 to-green-600",   href: "#",       description: "ペットショップ向け" },
  { slug: "school",  name: "School Hub",  shortName: "School",  emoji: "🎓", status: "planned", gradient: "from-violet-400 to-purple-600",   href: "#",       description: "スクール・教室向け" },
  { slug: "genba",   name: "Genba Hub",   shortName: "Genba",   emoji: "🏗️", status: "planned", gradient: "from-yellow-400 to-amber-600",    href: "#",       description: "現場・施工管理" },
];

export default async function PortalTop() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const displayName = user?.email?.split("@")[0] ?? "ゲスト";

  return (
    <div className="-mx-6 -my-10 min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-white">
      {/* グリーティング */}
      <div className="pt-12 pb-8 text-center px-6">
        <p className="text-xs text-indigo-400 font-medium tracking-widest uppercase mb-2">RaidQ Portal</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          こんにちは、{displayName} さん
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">業務改善SaaSプラットフォーム</p>
      </div>

      {/* アプリグリッド */}
      <div className="mx-auto max-w-sm sm:max-w-xl px-6 pb-12">
        <div className="grid grid-cols-3 gap-6 sm:gap-8">
          {APPS.map((app) => (
            <AppIcon key={app.slug} app={app} />
          ))}
        </div>

        {/* フッターリンク */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span>{user?.email}</span>
          <span>·</span>
          <Link href="/login" className="hover:text-gray-600 transition-colors">ログアウト</Link>
        </div>
      </div>
    </div>
  );
}

function AppIcon({ app }: { app: App }) {
  const isActive = app.status === "active";

  const icon = (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className={`
          flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center
          rounded-[22px] sm:rounded-[26px]
          bg-gradient-to-br ${app.gradient}
          text-3xl sm:text-4xl shadow-md
          transition-transform duration-150
          ${isActive ? "active:scale-90 hover:shadow-lg" : "opacity-40 saturate-50"}
        `}>
          {app.emoji}
        </div>
        {!isActive && (
          <span className="absolute -right-1.5 -top-1.5 rounded-full bg-gray-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
            近日
          </span>
        )}
      </div>
      <div className="text-center">
        <p className={`text-xs font-medium ${isActive ? "text-gray-800" : "text-gray-400"}`}>
          {app.shortName}
        </p>
        <p className={`text-[10px] mt-0.5 hidden sm:block ${isActive ? "text-gray-500" : "text-gray-300"}`}>
          {app.description}
        </p>
      </div>
    </div>
  );

  if (isActive) {
    return (
      <Link href={app.href} className="flex justify-center">
        {icon}
      </Link>
    );
  }
  return <div className="flex cursor-not-allowed justify-center">{icon}</div>;
}

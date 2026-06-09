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
};

const APPS: App[] = [
  { slug: "bakery", name: "Bakery Hub", shortName: "Bakery", emoji: "🍞", status: "active", gradient: "from-amber-400 to-orange-500", href: "/bakery" },
  { slug: "post", name: "Post Hub", shortName: "Post", emoji: "📱", status: "active", gradient: "from-sky-400 to-blue-600", href: "/post" },
  { slug: "beauty", name: "Beauty Hub", shortName: "Beauty", emoji: "💇", status: "planned", gradient: "from-pink-400 to-rose-500", href: "#" },
  { slug: "pet", name: "Pet Hub", shortName: "Pet", emoji: "🐾", status: "planned", gradient: "from-emerald-400 to-green-600", href: "#" },
  { slug: "school", name: "School Hub", shortName: "School", emoji: "🎓", status: "planned", gradient: "from-violet-400 to-purple-600", href: "#" },
  { slug: "genba", name: "Genba Hub", shortName: "Genba", emoji: "🏗️", status: "planned", gradient: "from-yellow-400 to-amber-600", href: "#" },
];

export default async function PortalTop() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="-mx-6 -my-10 min-h-[calc(100vh-65px)] bg-gradient-to-b from-indigo-50 via-sky-50 to-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {/* グリーティング */}
        <div className="relative mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">RaidQ Portal</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.email ? `${user.email} さん、ようこそ` : "業務改善SaaSプラットフォーム"}
          </p>
          <Link
            href="/login"
            className="absolute right-0 top-0 flex items-center gap-1 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur transition-colors hover:text-gray-900"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">ログアウト</span>
          </Link>
        </div>

        {/* ホーム画面グリッド */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8">
          {APPS.map((app) => (
            <AppIcon key={app.slug} app={app} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppIcon({ app }: { app: App }) {
  const isActive = app.status === "active";

  const icon = (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br ${app.gradient} text-3xl shadow-md transition-transform active:scale-95 sm:h-[72px] sm:w-[72px] ${isActive ? "" : "opacity-50 saturate-50"}`}
        >
          <span>{app.emoji}</span>
        </div>
        {!isActive && (
          <span className="absolute -right-1 -top-1 rounded-full bg-gray-700 px-1.5 py-0.5 text-[9px] font-medium text-white shadow">
            近日
          </span>
        )}
      </div>
      <span className={`max-w-[72px] truncate text-xs ${isActive ? "text-gray-700" : "text-gray-400"}`}>
        {app.shortName}
      </span>
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

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

export default async function PortalTop() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const displayName = user?.email?.split("@")[0] ?? "ゲスト";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-sky-50 to-white">
      {/* グリーティング */}
      <div className="pt-12 pb-8 text-center px-6">
        <p className="text-xs text-indigo-400 font-medium tracking-widest uppercase mb-2">RaidQ Portal</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          こんにちは、{displayName} さん
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">業務改善SaaSプラットフォーム</p>
      </div>

      {/* アプリグリッド */}
      <div className="mx-auto max-w-md px-6 pb-12">
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10">
          {APPS.map((app) => (
            <AppIcon key={app.slug} app={app} />
          ))}
        </div>
      </div>
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
          <p className="text-[10px] mt-0.5 hidden sm:block text-gray-500">{app.description}</p>
        </div>
      </div>
    </Link>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PlannedApp = {
  name: string;
  emoji: string;
  gradient: string;
  description: string;
  status: string;
};

const PLANNED: PlannedApp[] = [
  { name: "Beauty Hub", emoji: "💇", gradient: "from-pink-400 to-rose-500", description: "美容室・サロン向け予約管理", status: "構想中" },
  { name: "Pet Hub", emoji: "🐾", gradient: "from-emerald-400 to-teal-500", description: "ペットショップ・トリミング管理", status: "構想中" },
  { name: "School Hub", emoji: "🎓", gradient: "from-violet-400 to-purple-500", description: "教室・スクールの生徒管理", status: "構想中" },
  { name: "Genba Hub", emoji: "🏗️", gradient: "from-amber-400 to-yellow-500", description: "現場・施工管理", status: "構想中" },
];

export default async function RoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">実装予定のアプリ</h1>
        <p className="mt-1 text-sm text-gray-500">
          RaidQ Portal で今後追加を予定しているアプリです。順次開発していきます。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANNED.map((app) => (
          <div
            key={app.name}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${app.gradient} text-2xl shadow-sm`}
            >
              {app.emoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{app.name}</p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {app.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{app.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

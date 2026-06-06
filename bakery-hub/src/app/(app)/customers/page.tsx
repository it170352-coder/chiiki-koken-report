import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";
import SwipeToDelete from "@/components/SwipeToDelete";
import { createCustomer, deleteCustomer } from "./actions";

export default async function CustomersPage(props: PageProps<"/customers">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";

  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: customers } = await query;
  const list = (customers ?? []) as Customer[];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-bark-900">顧客管理</h1>

      <form action="/customers" method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="名前・電話番号で検索"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
        />
        <button className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700">
          検索
        </button>
        {q && (
          <Link
            href="/customers"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            クリア
          </Link>
        )}
      </form>

      <details className="rounded-2xl border border-bark-100 bg-white p-5">
        <summary className="cursor-pointer text-sm font-medium text-bark-800">
          ＋ 新しい顧客を登録
        </summary>
        <form action={createCustomer} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            required
            placeholder="氏名（必須）"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
          />
          <input
            name="phone"
            placeholder="電話番号"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
          />
          <input
            name="email"
            placeholder="メールアドレス"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
          />
          <input
            name="memo"
            placeholder="メモ（好み・アレルギー等）"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
          />
          <button className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700 sm:col-span-2">
            登録
          </button>
        </form>
      </details>

      <div className="overflow-hidden rounded-2xl border border-bark-100 bg-white">
        {list.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">
            {q ? "該当する顧客が見つかりません。" : "まだ顧客が登録されていません。"}
          </p>
        ) : (
          <ul className="divide-y divide-bark-50">
            {list.map((c) => (
              <li key={c.id}>
                <SwipeToDelete onDelete={deleteCustomer.bind(null, c.id)}>
                  <Link
                    href={`/customers/${c.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-bark-50/50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone || "電話番号未登録"}</p>
                    </div>
                    <span className="text-xs text-bark-600">詳細 ›</span>
                  </Link>
                </SwipeToDelete>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

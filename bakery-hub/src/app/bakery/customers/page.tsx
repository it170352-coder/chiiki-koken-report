import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import type { Customer, CustomerType } from "@/lib/types";
import SwipeToDelete from "@/components/SwipeToDelete";
import { createCustomer, deleteCustomer } from "./actions";

const TABS: { value: CustomerType | "all"; label: string }[] = [
  { value: "all", label: "全員" },
  { value: "individual", label: "個人" },
  { value: "corporate", label: "法人" },
];

export default async function CustomersPage(props: PageProps<"/bakery/customers">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const tab = (searchParams.tab as string) ?? "all";

  const { supabase: storeSupabase, storeId } = await getCurrentStore();
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (tab !== "all") query = query.eq("customer_type", tab);
  if (q) query = query.or(`name.ilike.%${q}%,contact_person.ilike.%${q}%,phone.ilike.%${q}%`);

  const { data: customers } = await query;
  const list = (customers ?? []) as Customer[];

  // 各タブのカウント
  const { data: allCustomers } = await supabase.from("customers").select("customer_type");
  const counts = {
    all: allCustomers?.length ?? 0,
    individual: allCustomers?.filter((c) => c.customer_type === "individual" || !c.customer_type).length ?? 0,
    corporate: allCustomers?.filter((c) => c.customer_type === "corporate").length ?? 0,
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-bark-900">顧客管理</h1>

      {/* タブ */}
      <div className="flex gap-1 rounded-xl bg-bark-100 p-1">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/customers?tab=${t.value}`}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t.value
                ? "bg-white text-bark-900 shadow-sm"
                : "text-gray-500 hover:text-bark-700"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                tab === t.value ? "bg-bark-100 text-bark-700" : "bg-white/60 text-gray-400"
              }`}
            >
              {counts[t.value as keyof typeof counts]}
            </span>
          </Link>
        ))}
      </div>

      {/* 検索 */}
      <form action="/customers" method="get" className="flex gap-2">
        <input type="hidden" name="tab" value={tab} />
        <input
          name="q"
          defaultValue={q}
          placeholder="名前・会社名・電話番号で検索"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
        />
        <button className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700">
          検索
        </button>
        {q && (
          <Link
            href={`/customers?tab=${tab}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            クリア
          </Link>
        )}
      </form>

      {/* 新規登録 */}
      <details className="rounded-2xl border border-bark-100 bg-white p-5">
        <summary className="cursor-pointer text-sm font-medium text-bark-800">
          ＋ 新しい顧客を登録
        </summary>
        <form action={createCustomer} className="mt-4 space-y-3">
          {/* タイプ選択 */}
          <div className="flex gap-3">
            {[
              { value: "individual", label: "個人" },
              { value: "corporate", label: "法人" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 has-[:checked]:border-bark-500 has-[:checked]:bg-bark-50"
              >
                <input
                  type="radio"
                  name="customer_type"
                  value={opt.value}
                  defaultChecked={opt.value === "individual"}
                  className="accent-bark-600"
                />
                <span className="text-sm font-medium text-gray-800">{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              required
              placeholder="氏名 / 会社名（必須）"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none sm:col-span-2"
            />
            <input
              name="contact_person"
              placeholder="担当者名（法人の場合）"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none"
            />
            <input
              name="department"
              placeholder="部署（法人の場合）"
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
              placeholder="メモ・備考"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-bark-500 focus:outline-none sm:col-span-2"
            />
            <button className="rounded-lg bg-bark-600 px-4 py-2 text-sm font-semibold text-white hover:bg-bark-700 sm:col-span-2">
              登録
            </button>
          </div>
        </form>
      </details>

      {/* 顧客一覧 */}
      <div className="overflow-hidden rounded-2xl border border-bark-100 bg-white">
        {list.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">
            {q ? "一致する顧客がいません" : "顧客を追加しましょう"}
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
                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.customer_type === "corporate"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-bark-100 text-bark-700"
                        }`}
                      >
                        {c.customer_type === "corporate" ? "法人" : "個人"}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">
                          {c.customer_type === "corporate"
                            ? [c.contact_person, c.department].filter(Boolean).join(" · ") || c.phone || "—"
                            : c.phone || "—"}
                        </p>
                      </div>
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

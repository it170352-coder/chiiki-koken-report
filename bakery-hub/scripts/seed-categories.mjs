// カテゴリ別サンプル：複数カテゴリの商品を追加し、直近10日分の販売データを投入
// 使い方: SEED_EMAIL=... SEED_PASSWORD=... node scripts/seed-categories.mjs
const URL = "https://qmmnrxbekvmopdpxdrji.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbW5yeGJla3Ztb3BkcHhkcmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODMzNjksImV4cCI6MjA5NjA1OTM2OX0.wC9FZ93LzpO2Xscq6uRMTKUYefMz6fkm13AzbnhRBQ0";
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;

// 追加する商品（カテゴリ別）と1日あたりの販売数
const SEED = [
  { name: "食パン", category: "食事パン", price: 400, soldPerDay: 40 },
  { name: "あんパン", category: "菓子パン", price: 180, soldPerDay: 80 },
  { name: "カレーパン", category: "惣菜パン", price: 220, soldPerDay: 60 },
];

const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

async function main() {
  const authRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const auth = await authRes.json();
  if (!auth.access_token) {
    console.error("ログイン失敗:", auth);
    process.exit(1);
  }
  const token = auth.access_token;
  const userId = auth.user.id;
  const headers = { apikey: ANON, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  console.log("ログイン成功 user:", userId);

  // 既存商品を取得（名前重複を避ける）
  const existRes = await fetch(`${URL}/rest/v1/products?select=id,name`, { headers });
  const existing = await existRes.json();
  const byName = new Map(existing.map((p) => [p.name, p.id]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wastedByDay = [3, 5, 2, 6, 4, 7, 3, 8, 5, 4];

  for (const s of SEED) {
    let productId = byName.get(s.name);
    if (!productId) {
      const insRes = await fetch(`${URL}/rest/v1/products`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({
          user_id: userId,
          name: s.name,
          category: s.category,
          price: s.price,
          is_active: true,
        }),
      });
      const inserted = await insRes.json();
      if (!insRes.ok) {
        console.error(`商品追加失敗(${s.name}):`, inserted);
        continue;
      }
      productId = inserted[0].id;
      console.log(`商品追加: ${s.name}（${s.category}）¥${s.price}`);
    } else {
      console.log(`商品は既存: ${s.name}`);
    }

    const rows = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const wasted = wastedByDay[9 - i];
      rows.push({
        user_id: userId,
        product_id: productId,
        date: fmt(d),
        produced: s.soldPerDay + wasted,
        sold: s.soldPerDay,
        wasted,
      });
    }
    const upRes = await fetch(`${URL}/rest/v1/inventory_logs?on_conflict=user_id,product_id,date`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(rows),
    });
    const result = await upRes.json();
    if (!upRes.ok) {
      console.error(`在庫投入失敗(${s.name}):`, result);
      continue;
    }
    console.log(`  → ${s.name}: 10日分投入（売上 ¥${(s.soldPerDay * s.price * 10).toLocaleString()}）`);
  }
  console.log("完了");
}

main();

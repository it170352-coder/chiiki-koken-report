// サンプルデータ投入：直近10日間、各日100個販売
// 使い方: node scripts/seed-sample.mjs
const URL = "https://qmmnrxbekvmopdpxdrji.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbW5yeGJla3Ztb3BkcHhkcmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0ODMzNjksImV4cCI6MjA5NjA1OTM2OX0.wC9FZ93LzpO2Xscq6uRMTKUYefMz6fkm13AzbnhRBQ0";
const EMAIL = process.env.SEED_EMAIL;
const PASSWORD = process.env.SEED_PASSWORD;

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

async function main() {
  // 1. ログイン
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
  console.log("ログイン成功 user:", userId);

  const headers = {
    apikey: ANON,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 2. 有効な商品を取得（先頭1件を対象）
  const prodRes = await fetch(
    `${URL}/rest/v1/products?select=id,name,price&is_active=eq.true&order=created_at`,
    { headers },
  );
  const products = await prodRes.json();
  if (!products.length) {
    console.error("有効な商品がありません。先に商品を登録してください。");
    process.exit(1);
  }
  const product = products[0];
  console.log("対象商品:", product.name, `¥${product.price}`);

  // 3. 直近10日分の在庫ログを upsert
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wastedByDay = [6, 4, 9, 3, 7, 5, 11, 2, 8, 4]; // 日替わりの廃棄数（分析に変化を出すため）
  const rows = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const wasted = wastedByDay[9 - i];
    rows.push({
      user_id: userId,
      product_id: product.id,
      date: fmt(d),
      produced: 100 + wasted, // 売り切り＋廃棄分を製造
      sold: 100,
      wasted,
    });
  }

  const upRes = await fetch(
    `${URL}/rest/v1/inventory_logs?on_conflict=user_id,product_id,date`,
    {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(rows),
    },
  );
  const result = await upRes.json();
  if (!upRes.ok) {
    console.error("投入失敗:", result);
    process.exit(1);
  }
  console.log(`投入完了: ${rows.length}日分`);
  console.log(
    `期間売上: ¥${(100 * product.price * 10).toLocaleString()} / 販売 1000個 / 廃棄 ${wastedByDay.reduce((a, b) => a + b, 0)}個`,
  );
}

main();

import { createClient } from "@supabase/supabase-js";

// 管理者キー(service_role)を使うサーバー専用クライアント。
// このキーは全データを操作できるため、絶対にブラウザへ渡さないこと。
// 環境変数 SUPABASE_SERVICE_ROLE_KEY はサーバー側にのみ設定する（NEXT_PUBLIC_ にしない）。
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("管理者キーが未設定です。");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

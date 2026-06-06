# Bakery Hub 設計ドキュメント

作成日：2026年6月3日 / 担当：architect 相当（本体）

> 企画書「Bakery_Hub_企画書.md」をもとに、実装に必要な設計を定義する。

---

## 1. 技術選定と根拠

| 項目 | 採用技術 | 根拠 |
|------|---------|------|
| フレームワーク | Next.js 15（App Router） | 課題推奨。SSR/CSR両対応・認証との相性が良い |
| 言語 | TypeScript | 課題推奨。型安全でバグを減らせる |
| スタイル | Tailwind CSS | 課題推奨。レスポンシブ対応が速い |
| DB・認証 | Supabase（Postgres + Auth） | 課題推奨。DBと認証が一体・RLSで安全 |
| ホスティング想定 | Vercel | Next.jsと相性が良い（デプロイは任意） |

設置場所：プロジェクト直下の `bakery-hub/`（既存のスライド生成スクリプトと分離するため）。

---

## 2. データベース設計

店舗（tenant）単位でデータを分離する。1ログインユーザー＝1店舗を基本とする（MVP）。

### テーブル一覧

#### profiles（店舗オーナー・スタッフ）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK, auth.users参照) | ユーザーID |
| store_name | text | 店舗名 |
| role | text | owner / staff |
| created_at | timestamptz | 作成日時 |

#### customers（顧客）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | 顧客ID |
| user_id | uuid (FK→profiles) | 所有店舗 |
| name | text | 氏名 |
| phone | text | 電話番号 |
| email | text | メール（任意） |
| memo | text | メモ（アレルギー・好み等） |
| created_at | timestamptz | 登録日時 |

#### products（商品）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | 商品ID |
| user_id | uuid (FK→profiles) | 所有店舗 |
| name | text | 商品名 |
| category | text | カテゴリ（食パン・惣菜パン等） |
| price | integer | 販売価格（円） |
| is_active | boolean | 販売中フラグ |
| created_at | timestamptz | 登録日時 |

#### reservations（予約・取り置き）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | 予約ID |
| user_id | uuid (FK→profiles) | 所有店舗 |
| customer_id | uuid (FK→customers) | 予約者 |
| pickup_at | timestamptz | 受取日時 |
| status | text | pending / ready / completed / cancelled |
| memo | text | 備考 |
| created_at | timestamptz | 受付日時 |

#### reservation_items（予約明細）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | 明細ID |
| reservation_id | uuid (FK→reservations) | 予約 |
| product_id | uuid (FK→products) | 商品 |
| quantity | integer | 個数 |

#### inventory_logs（在庫・販売・廃棄の日次記録）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | 記録ID |
| user_id | uuid (FK→profiles) | 所有店舗 |
| product_id | uuid (FK→products) | 商品 |
| date | date | 対象日 |
| produced | integer | 製造数 |
| sold | integer | 販売数 |
| wasted | integer | 廃棄数 |

> 残数 = produced − sold − wasted（計算で算出、保存しない）

### リレーション図（テキスト）

```
profiles (1) ── (N) customers
profiles (1) ── (N) products
profiles (1) ── (N) reservations ── (N) reservation_items ── (1) products
profiles (1) ── (N) inventory_logs ── (1) products
customers (1) ── (N) reservations
```

### セキュリティ（RLS）

全テーブルに Row Level Security を有効化し、`user_id = auth.uid()` の行だけ参照・編集できるようにする。  
他店舗のデータは一切見えない設計。

---

## 3. 画面構成

| パス | 画面 | 内容 |
|------|------|------|
| /login | ログイン | メール＋パスワードでログイン |
| /signup | 新規登録 | 店舗名＋メール＋パスワード |
| / | ダッシュボード | 本日の予約数・売上・人気商品・在庫・顧客数 |
| /customers | 顧客一覧 | 検索・一覧 |
| /customers/[id] | 顧客詳細 | 情報・来店/購入履歴・メモ編集 |
| /reservations | 予約一覧 | 日付別・ステータス別表示 |
| /reservations/new | 予約登録 | 顧客・商品・個数・受取日時 |
| /products | 商品一覧 | カテゴリ・価格・販売状況 |
| /inventory | 在庫管理 | 製造数・販売数・廃棄数の入力と残数表示 |

### 共通レイアウト
- 左サイドバー（または上部ナビ）：ダッシュボード／顧客／予約／商品／在庫
- レスポンシブ：スマホではナビをハンバーガーメニュー化
- ログイン必須（未ログインは /login へリダイレクト）

---

## 4. 実装フェーズ

### フェーズ1（MVP・今回実装）
1. 認証（ログイン・新規登録・保護ルート）
2. ダッシュボード（本日の予約数・売上・人気商品・在庫状況・顧客数）
3. 顧客管理（一覧・検索・詳細・メモ）
4. 予約管理（登録・一覧・ステータス変更）
5. 商品管理（一覧・登録・カテゴリ・価格）
6. 在庫管理（製造・販売・廃棄の記録・残数表示）

### フェーズ2（加点・今回は未実装、設計のみ）
- 曜日・時間帯別販売分析
- リピーター分析
- 通知機能
- 営業日カレンダー

### フェーズ3
- AI販売予測

---

## 5. ダッシュボードの集計ロジック

| 指標 | 算出方法 |
|------|---------|
| 本日の予約数 | reservations で pickup_at が当日かつ status≠cancelled の件数 |
| 本日の売上 | 当日の inventory_logs.sold × products.price の合計 |
| 人気商品ランキング | reservation_items の quantity 合計（または sold 合計）上位 |
| 在庫状況 | 当日 inventory_logs の残数（produced−sold−wasted） |
| 顧客数 | customers の総件数 |

---

## 6. 要確認事項

- 1ユーザー＝1店舗とするか、複数スタッフが同じ店舗を共有するか → MVPは1ユーザー1店舗。スタッフ共有はフェーズ2。
- 売上の定義 → MVPは「販売数×価格」の単純計算（実POS連携はしない）。
- Supabaseのプロジェクト作成・キー取得は石田さんの作業が必要（手順は別途用意）。

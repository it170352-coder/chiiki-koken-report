# 高槻市 地域貢献リサーチ＆ロードマップ作成

## プロジェクトの目的

高槻市における地域貢献活動のリサーチを行い、具体的なロードマップとして整理・提案すること。

## Claude Code へのお願い

- 必ず日本語で答えること
- 専門用語を避け、初心者にもわかる言葉で説明すること
- 専門用語を使うときは、必ずカッコで意味を補足すること
- コマンドやファイル操作の実行許可（Allow/Deny）を求めるときは、
  「何をしようとしているか」「Allow すると何が起きるか」を日本語で説明すること

## 成果物

- 高槻市_地域貢献リサーチレポート.md
- 高槻_ロードマップ.md
- 高槻_地域貢献プロジェクト_ロードマップ.pptx
- 会議資料（高槻MTG No1.pdf 等）
- Takatsuki BASE 営業資料（03_資料スライド/）
  - ベクター版: `Takatsuki_BASE_営業資料_10ページ.pptx` + `.pdf`（python-pptx 生成・シャープ・推奨）
  - 画像版: `Takatsuki_BASE_営業資料_画像版.pptx` + `.pdf`（3倍LANCZOS+UnsharpMask で解像度改善済み）
  - 営業1枚資料: `Takatsuki_BASE_営業1枚資料.html` + `.pdf` + `.pptx`

## Takatsuki BASE 現状（2026-06-11時点）

- ステータス: 営業資料 2系統 完成。石田さんの確認・先方提出待ち
- 未解決: 元画像（`資料の画像.png`）スライド9に誤字「観光害」→「観光客」。元データ修正が必要
- 次回: 「Canva 等から高解像度書き出し可能か？」の回答を受けて画像版を差し替えるかどうか判断

## macOS 変換ツール制約メモ

この環境で使えないツール: LibreOffice(soffice) / pdftoppm / ImageMagick / Real-ESRGAN / torch / cv2 / numpy / PyMuPDF(fitz)
PPTX→PDF変換: Keynote の AppleScript(osascript) で行う。PDF→PNG は sips で可能。
詳細パターン: Obsidian 01_Knowledge/Keynote_PPTX_to_PDF_AppleScript.md を参照

## 触ってほしくないファイル

- node_modules/ 配下（外部ライブラリが入っているフォルダ）
- create_slides.js（スライド自動生成スクリプト。動作確認済みのため変更不要）

## 運用ルール

- ファイルを新規作成する前に、似た目的のファイルが既にないか確認すること
- 「final」「v2」「new」「temp」のような名前のファイルを増やさないこと
- エラーが出たら、推測ではなくエラーメッセージを確認してから対処すること
- 石田さんが「わからない」と言ったときは、例えを使って噛み砕いて再説明すること

## 成果物・提案の根拠明示ルール

何かを作成・提案するときは、必ず以下を明記すること：

- **根拠あり**の場合：情報の出典（公式サイト・調査データ・業界標準など）を具体的に示す
- **根拠なし**の場合：「これはClaude が一般的な知識をもとに構成したものであり、検証されていません」と明記する
- **一部根拠あり**の場合：項目ごとに「根拠あり／なし」を区別して示す

数値・基準・ランク・点数配分など「なぜこの数字なのか」が問われる内容は特に注意すること。

### 出典の記載方法

根拠がある情報には、以下の形式で出典を記載すること：

- **公式サイト・ウェブページ**：サイト名・ページタイトル・URL・参照日
  - 例）総務省「令和5年 情報通信メディアの利用時間と情報行動に関する調査」https://www.soumu.go.jp/xxx　（2026年5月参照）
- **調査・統計データ**：調査機関名・調査名・発行年・該当ページや項目
  - 例）Meta社「Instagramビジネス活用レポート2024」p.12「中小企業のエンゲージメント率」
- **書籍・記事**：著者・タイトル・出版社・発行年
  - 例）〇〇著『SNSマーケティング実践ガイド』△△出版、2023年、p.45
- **業界標準・慣習**：どの業界・職種での一般的な基準かを明示
  - 例）「デジタルマーケティング業界では一般的に〇〇とされている（出典：特定の研究なし）」

出典が見つからない・確認できない場合は、推測で書かず「未確認」と記載すること。

---

## Obsidian 連携ルール

**Obsidian Vault**: `/Users/ishida/Desktop/Obsidian/Ishida Knowledge Vault/`

### フォルダ構成

| フォルダ | 用途 |
|---------|------|
| `02_Projects/` | プロジェクトごとの状況・残タスク |
| `03_Sessions/` | セッション作業ログ（YYYY-MM-DD.md） |
| `04_Decisions/` | 重要な方針決定の記録 |
| `01_Knowledge/` | 再利用可能な技術知見 |
| `08_Daily/` | 日報（既存） |
| `Dashboard.md` | プロジェクト一覧とタイムライン |

### 作業開始前の必須確認

1. `Dashboard.md` を読み、プロジェクト一覧と最新タイムラインを確認する
2. 作業対象があれば `02_Projects/<name>.md` を読む
3. `03_Sessions/` の最新ファイルを確認する

### 「ここまでで保存」時の処理

1. `03_Sessions/YYYY-MM-DD.md` を作成（今日やったこと・完了タスク・次回引き継ぎ）
2. 関連 `02_Projects/<name>.md` を更新
3. `Dashboard.md` のタイムライン最上部に1行追記
4. 再利用可能な知見があれば `01_Knowledge/` にファイル作成

軽微な修正（ファイル2個以内・スキーマ/UI/認証に変更なし）は Dashboard.md への1行追記のみでよい。

### 重要な方針変更時

`04_Decisions/Decisions.md` に記録する（日付・決定内容・理由・影響範囲・ステータス）。

---

## 絶対優先ルール（実行前に必ず確認を取ること）

| 操作カテゴリ | 具体例 |
|------------|--------|
| ファイル・ディレクトリの削除 | `rm -rf`、大量ファイル一括削除 |
| DBスキーマ変更・マイグレーション | `prisma migrate`、本番テーブル削除 |
| 本番デプロイ | `vercel --prod`、`git push origin main` |
| 秘匿情報の操作 | `.env` の編集・表示・コミット |
| 認証・権限の変更 | API キー更新、アクセス権限変更 |
| 強制上書き | `git push --force`、`git reset --hard` |

実行内容・影響範囲を1文で説明してから承諾を待つこと。

---

## RaidQ Portal SaaS（01_SaaS企画/、bakery-hub/）

### 現状（2026-06-09 時点）

- ステータス: RaidQ Portal として本番稼働中（Bakery Hub + Post Hub の兄弟構造）
- 本番URL: https://raidq-portal-hub.vercel.app（旧 bakery-hub-ten.vercel.app は307リダイレクトで存続）
- アプリ本体: bakery-hub/（Next.js 16 + React 19 + TypeScript + Tailwind v4 + Supabase）
- Supabase URL: https://qmmnrxbekvmopdpxdrji.supabase.co（プロジェクト名: RaidQ Portal）
- 認証: Confirm email を現在無効化中。本番移行時はカスタムSMTP設定後に再有効化すること
- 環境変数: SUPABASE_SERVICE_ROLE_KEY を Vercel に登録済み（NEXT_PUBLIC_ なし）
- UIテーマ: 全画面ライト（白）系統一・ダーク系は今後使用禁止（2026-06-09 恒久ルール化）

### プロジェクト構造

```
RaidQ Portal (/)
├── Bakery Hub（/bakery）— ベーカリー向け管理SaaS
└── Post Hub（/post）— SNS運用業務支援SaaS
```

Bakery Hub と Post Hub は兄弟関係。Post Hub は Bakery Hub の親ではない。

### 直近セッション（2026-06-09）で実施したこと

- Vercel プロジェクト名・本番URL変更（bakery-hub → raidq-portal）
- 認証画面（login/signup）のRaidQ Portalブランディングへ刷新
- 残骸ディレクトリ削除（src/app/(app)/ 53ファイル・src/app/apps/ 57ファイル）
- Portal層＋Post Hub全19ファイルのダーク→ライトテーマ変換
- 資料・ドキュメント類の本番URL表記更新

### Bakery Hub NavBar 現在の構成

ダッシュボード / 予約 / 顧客 / 商品 / 在庫 / 原材料 / 来客数 / 分析 / 設定

### Post Hub カレンダー表示（2026-06-11 動作確認済み）

- 投稿管理（/post/posts）にカンバン／月／週の3ビュー実装済み
- 月表示: カレンダーグリッド・曜日ヘッダー・今日ハイライト・投稿ステータス色表示・モバイルはドット表示
- 週表示: 7日間・今日ハイライト・投稿カード表示
- ビュー切替・前後ナビ・今日ボタン・クライアント絞り込み すべて dev サーバーで動作確認済み（コンソールエラーなし）
- 必須機能①は完了。実装ファイル: bakery-hub/src/app/post/posts/PostsClient.tsx

### Post Hub 投稿ショートカット（2026-06-12）

- 全画面下部中央に「＋」FAB（src/app/post/layout.tsx）→ /post/posts/new へ遷移。作成画面では非表示

### Portal ユーザー管理・権限（2026-06-12 新設）

- /users でユーザー編集（名前・メール・パスワード再設定・削除）。実装: src/app/(portal)/users/
- portal レベルの権限を新設: user_metadata.role = "admin" | "user"（Bakery Hub の store_members 権限とは別物）
- 削除・権限変更は管理者(admin)のみ。編集は全員可・自己昇格不可
- 設定（(portal)/settings/）のユーザー追加に権限 select 追加
- 管理者アカウント: t_ishida@andskill.com（設定済み）

### 次回やるべきこと

1. リサーチ資料（Buffer/Hootsuite/Later/Metricool/SocialDog 調査）作成
2. 企画書・営業提案資料（Post Hub版）作成
3. カスタムSMTP設定 + Confirm email 再有効化

### 触ってほしくないファイル（追加）

- bakery-hub/.env.local（秘密情報。gitignore 済み）
- 01_SaaS企画/Bakery_Hub_営業スライド生成.js（動作確認済みスクリプト）

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// react-iconsのパス解決
const { FaCalendarAlt } = require("/opt/homebrew/lib/node_modules/react-icons/fa");
const { FaUsers } = require("/opt/homebrew/lib/node_modules/react-icons/fa");
const { FaBoxOpen } = require("/opt/homebrew/lib/node_modules/react-icons/fa");
const { FaClock } = require("/opt/homebrew/lib/node_modules/react-icons/fa");
const { FaCheckCircle } = require("/opt/homebrew/lib/node_modules/react-icons/fa");

// カラーパレット（ブラウン・ベージュ系）
const C = {
  brown:     "5C3317",  // ダークブラウン（メインタイトル）
  midBrown:  "8B5E3C",  // ミディアムブラウン（アクセント）
  lightBrown:"C49A6C",  // ライトブラウン
  cream:     "FDF6EE",  // クリーム（背景）
  cardBg:    "FFFFFF",  // カード背景
  textDark:  "3B2A1A",  // テキスト濃
  textMid:   "6B4C30",  // テキスト中
  textLight: "9C7B5A",  // テキスト薄
  accent:    "E07B39",  // オレンジブラウン（強調）
  divider:   "E8D5C0",  // 区切り線
};

async function iconToBase64(IconComponent, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color: `#${color}`, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function main() {
  const pres = new pptxgen();
  // A4横向き相当 (LAYOUT_WIDE: 13.3" × 7.5")
  pres.layout = "LAYOUT_WIDE";

  const slide = pres.addSlide();
  slide.background = { color: C.cream };

  // ── ヘッダー帯 ──────────────────────────────────────────
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 1.35,
    fill: { color: C.brown }, line: { color: C.brown }
  });

  // ロゴ・タイトル
  slide.addText("🍞 Bakery Hub", {
    x: 0.4, y: 0.08, w: 5, h: 0.6,
    fontSize: 28, bold: true, color: "FFFFFF",
    fontFace: "Georgia", margin: 0
  });
  slide.addText("パン屋専用 業務管理クラウド", {
    x: 0.4, y: 0.72, w: 5, h: 0.45,
    fontSize: 13, color: "F0DFC8", fontFace: "Calibri", margin: 0
  });

  // キャッチコピー（右）
  slide.addText("予約・顧客・在庫を1画面に集約。\n売れ残りも、業務中断も、減らします。", {
    x: 6.5, y: 0.1, w: 6.4, h: 1.1,
    fontSize: 13.5, color: "FFF5E8", align: "right",
    fontFace: "Calibri", valign: "middle", margin: 0
  });

  // ── 課題 → 解決 セクション ──────────────────────────────
  // セクションラベル
  slide.addText("こんなお悩みありませんか？", {
    x: 0.4, y: 1.55, w: 5.5, h: 0.35,
    fontSize: 11, bold: true, color: C.midBrown,
    fontFace: "Calibri", margin: 0
  });

  const problems = [
    "予約がLINE・電話・メモにバラバラ",
    "焼きすぎて廃棄が毎週出てしまう",
    "常連さんの好みが記録に残らない",
    "問い合わせ対応で製造が中断される",
  ];

  problems.forEach((txt, i) => {
    const y = 2.0 + i * 0.45;
    // チェックアイコン代わりの丸
    slide.addShape(pres.shapes.OVAL, {
      x: 0.38, y: y + 0.04, w: 0.22, h: 0.22,
      fill: { color: C.accent }, line: { color: C.accent }
    });
    slide.addText(txt, {
      x: 0.7, y: y, w: 5.2, h: 0.35,
      fontSize: 11.5, color: C.textDark, fontFace: "Calibri", margin: 0
    });
  });

  // 矢印
  slide.addText("→", {
    x: 5.85, y: 2.4, w: 0.6, h: 0.6,
    fontSize: 32, bold: true, color: C.accent, align: "center", margin: 0
  });

  // ── 解決策（右カラム）──────────────────────────────────
  slide.addText("Bakery Hub が解決します", {
    x: 6.6, y: 1.55, w: 6.3, h: 0.35,
    fontSize: 11, bold: true, color: C.midBrown,
    fontFace: "Calibri", margin: 0
  });

  const features = [
    { icon: "📅", label: "予約一元管理", desc: "LINE・電話の予約をまとめてクラウドで管理" },
    { icon: "👥", label: "顧客カルテ",   desc: "常連の好み・来店履歴を自動蓄積" },
    { icon: "📦", label: "在庫・廃棄記録", desc: "製造数・廃棄数を日次記録して最適化" },
    { icon: "⏱", label: "ダッシュボード", desc: "本日の予約・売上・在庫を1画面で確認" },
  ];

  features.forEach((f, i) => {
    const x = 6.6 + (i % 2) * 3.3;
    const y = 2.0 + Math.floor(i / 2) * 1.1;

    // カード背景
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 3.1, h: 0.95,
      fill: { color: C.cardBg },
      line: { color: C.divider, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.07 }
    });
    // アクセントライン（左）
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.07, h: 0.95,
      fill: { color: C.accent }, line: { color: C.accent }
    });
    slide.addText(f.icon + " " + f.label, {
      x: x + 0.15, y: y + 0.08, w: 2.9, h: 0.3,
      fontSize: 12, bold: true, color: C.textDark,
      fontFace: "Calibri", margin: 0
    });
    slide.addText(f.desc, {
      x: x + 0.15, y: y + 0.42, w: 2.9, h: 0.45,
      fontSize: 9.5, color: C.textMid, fontFace: "Calibri", margin: 0
    });
  });

  // ── 差別化3点 ───────────────────────────────────────────
  const diffY = 4.35;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: diffY, w: 13.3, h: 0.02,
    fill: { color: C.divider }, line: { color: C.divider }
  });

  const diffs = [
    { emoji: "🥐", title: "パン屋専用",   body: "売切れ・取り置き・予約に\n完全最適化" },
    { emoji: "✅", title: "すぐ使える",   body: "スマホのみでOK。\n初日から現場で使える" },
    { emoji: "⏰", title: "時間も守る",   body: "業務中断を減らし\n製造時間を守る" },
  ];

  diffs.forEach((d, i) => {
    const x = 0.5 + i * 4.35;
    slide.addText(d.emoji, {
      x, y: diffY + 0.2, w: 0.6, h: 0.55,
      fontSize: 26, align: "center", margin: 0
    });
    slide.addText(d.title, {
      x: x + 0.65, y: diffY + 0.22, w: 3.5, h: 0.3,
      fontSize: 13, bold: true, color: C.brown,
      fontFace: "Georgia", margin: 0
    });
    slide.addText(d.body, {
      x: x + 0.65, y: diffY + 0.55, w: 3.5, h: 0.55,
      fontSize: 10.5, color: C.textMid, fontFace: "Calibri", margin: 0
    });
  });

  // ── 料金 ────────────────────────────────────────────────
  const priceY = 5.3;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: priceY, w: 13.3, h: 1.85,
    fill: { color: C.brown }, line: { color: C.brown }
  });

  slide.addText("料金プラン", {
    x: 0.4, y: priceY + 0.2, w: 3, h: 0.4,
    fontSize: 12, bold: true, color: "F0DFC8",
    fontFace: "Calibri", margin: 0
  });

  // スタータープラン
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 3.5, y: priceY + 0.18, w: 4.0, h: 1.38,
    fill: { color: "7A4A28" }, line: { color: "7A4A28" }
  });
  slide.addText("スタータープラン", {
    x: 3.6, y: priceY + 0.22, w: 3.8, h: 0.32,
    fontSize: 11, color: "F0DFC8", fontFace: "Calibri", margin: 0
  });
  slide.addText([
    { text: "¥9,800", options: { fontSize: 26, bold: true, color: "FFFFFF" } },
    { text: " / 月", options: { fontSize: 12, color: "F0DFC8" } },
  ], { x: 3.6, y: priceY + 0.55, w: 3.8, h: 0.55, margin: 0 });
  slide.addText("1店舗・利用者3名まで", {
    x: 3.6, y: priceY + 1.1, w: 3.8, h: 0.35,
    fontSize: 9.5, color: "D4B896", fontFace: "Calibri", margin: 0
  });

  // スタンダードプラン
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 8.0, y: priceY + 0.18, w: 4.8, h: 1.38,
    fill: { color: C.accent }, line: { color: C.accent }
  });
  slide.addText("スタンダードプラン  ★人気", {
    x: 8.1, y: priceY + 0.22, w: 4.6, h: 0.32,
    fontSize: 11, color: "FFF0E0", fontFace: "Calibri", margin: 0
  });
  slide.addText([
    { text: "¥19,800", options: { fontSize: 26, bold: true, color: "FFFFFF" } },
    { text: " / 月", options: { fontSize: 12, color: "FFF0E0" } },
  ], { x: 8.1, y: priceY + 0.55, w: 4.6, h: 0.55, margin: 0 });
  slide.addText("1店舗・利用者10名・分析レポート付き", {
    x: 8.1, y: priceY + 1.1, w: 4.6, h: 0.35,
    fontSize: 9.5, color: "FFE0C0", fontFace: "Calibri", margin: 0
  });

  // URL・フッター
  slide.addText("まず無料でお試しください　→　https://raidq-portal-hub.vercel.app", {
    x: 0.4, y: priceY + 0.65, w: 2.8, h: 0.6,
    fontSize: 9, color: "D4B896", fontFace: "Calibri", margin: 0
  });

  const outPath = "/Users/ishida/Desktop/claude code/bakery-hub/Bakery_Hub_営業1枚資料.pptx";
  await pres.writeFile({ fileName: outPath });
  console.log("作成完了:", outPath);
}

main().catch(console.error);

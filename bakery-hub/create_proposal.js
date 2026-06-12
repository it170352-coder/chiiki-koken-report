const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Bakery Hub 企画提案資料";

const C = {
  white:  "FFFFFF",
  cream:  "FAF8F4",
  beige:  "C8956C",
  brown:  "6B3F24",
  orange: "E8832A",
  black:  "1A1A1A",
  gray:   "888888",
  border: "E8DDD4",
  light:  "F4EFE9",
};

const W = 10;
const H = 5.625;

const FONT = "Hiragino Sans";
const FONT_NUM = "Helvetica Neue";

function footer(slide, num) {
  slide.addText("Bakery Hub", {
    x: 0.45, y: H - 0.32, w: 2, h: 0.22,
    fontSize: 8, color: C.beige, align: "left", margin: 0, fontFace: FONT,
  });
  slide.addText(String(num) + " / 20", {
    x: W - 0.9, y: H - 0.32, w: 0.6, h: 0.22,
    fontSize: 8, color: C.gray, align: "right", margin: 0,
  });
}

// ─── 01: Cover ────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.brown };

  // Large left vertical label
  s.addText("事業企画提案資料", {
    x: 0.45, y: 0.5, w: 0.25, h: 4.0,
    fontSize: 9, color: C.beige, align: "center", margin: 0,
    rotate: 270,
  });

  // Thin vertical rule
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.85, y: 0.5, w: 0.03, h: 4.2,
    fill: { color: "7A4A2E" }, line: { color: "7A4A2E" },
  });

  // Main title — large, left-aligned
  s.addText("Bakery\nHub", {
    x: 1.15, y: 0.55, w: 5.5, h: 3.2,
    fontSize: 82, color: C.white, bold: true, align: "left",
    fontFace: FONT, margin: 0, lineSpacingMultiple: 0.9,
  });

  // Tagline
  s.addText("勘に頼るパン屋経営を、データ経営へ", {
    x: 1.15, y: 3.85, w: 6.5, h: 0.45,
    fontSize: 16, color: C.beige, align: "left", margin: 0, fontFace: FONT,
  });

  // Date — bottom right
  s.addText("2026年6月", {
    x: W - 2.0, y: H - 0.5, w: 1.7, h: 0.3,
    fontSize: 10, color: C.gray, align: "right", margin: 0,
  });

  footer(s, 1);
}

// ─── 02: Executive Summary ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  // Left — big label
  s.addText("Executive\nSummary", {
    x: 0.45, y: 0.45, w: 3.2, h: 1.4,
    fontSize: 28, color: C.border, bold: true, align: "left",
    fontFace: FONT_NUM, margin: 0, lineSpacingMultiple: 0.95,
  });
  s.addText("エグゼクティブサマリー", {
    x: 0.45, y: 1.95, w: 3.5, h: 0.42,
    fontSize: 13, color: C.brown, bold: true, align: "left", fontFace: FONT, margin: 0,
  });

  // Vertical divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.85, y: 0.45, w: 0.03, h: 4.6,
    fill: { color: C.border }, line: { color: C.border },
  });

  // Right — 3 items stacked, not boxed
  const items = [
    { tag: "課題", text: "パン屋の製造量は職人の経験と勘に依存。売切れと廃棄が毎日発生し、利益を圧迫している" },
    { tag: "解決策", text: "売上・廃棄・在庫データを一元管理し、翌日の推奨製造数を自動算出するSaaSを提供" },
    { tag: "提供価値", text: "廃棄ロス削減・機会損失回避により、個人経営パン屋の利益率を改善" },
  ];
  items.forEach((item, i) => {
    const y = 0.52 + i * 1.55;
    s.addText(item.tag, {
      x: 4.15, y, w: 1.2, h: 0.36,
      fontSize: 10, color: C.orange, bold: true, align: "left",
      fontFace: FONT, margin: 0, charSpacing: 2,
    });
    s.addText(item.text, {
      x: 4.15, y: y + 0.38, w: 5.45, h: 1.0,
      fontSize: 13, color: C.black, align: "left", fontFace: FONT, margin: 0, wrap: true,
    });
    if (i < 2) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 4.15, y: y + 1.45, w: 5.4, h: 0.02,
        fill: { color: C.border }, line: { color: C.border },
      });
    }
  });

  footer(s, 2);
}

// ─── 03: Industry Status ───────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("パン屋業界の現状", {
    x: 0.55, y: 0.42, w: 7, h: 0.55,
    fontSize: 13, color: C.gray, align: "left", fontFace: FONT, margin: 0,
  });

  // Giant statement
  s.addText("「何個作れば\n売り切れるか」を\n計算できている\nパン屋は少ない", {
    x: 0.55, y: 1.0, w: 4.8, h: 3.8,
    fontSize: 30, color: C.brown, bold: true, align: "left",
    fontFace: FONT, margin: 0, lineSpacingMultiple: 1.15,
  });

  // Stats on the right — stacked vertically
  const stats = [
    { n: "6万店+", label: "全国のパン屋・製菓店数" },
    { n: "30〜40%", label: "廃棄・値引きが発生\nする店舗の割合（推計）" },
  ];
  stats.forEach((st, i) => {
    const y = 0.95 + i * 2.1;
    s.addText(st.n, {
      x: 6.2, y, w: 3.5, h: 1.1,
      fontSize: 48, color: C.orange, bold: true, align: "left",
      fontFace: FONT_NUM, margin: 0,
    });
    s.addText(st.label, {
      x: 6.2, y: y + 1.05, w: 3.5, h: 0.6,
      fontSize: 11, color: C.gray, align: "left", margin: 0,
    });
    if (i < stats.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 6.2, y: y + 1.75, w: 3.3, h: 0.02,
        fill: { color: C.border }, line: { color: C.border },
      });
    }
  });

  // Vertical divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.75, y: 0.95, w: 0.02, h: 4.0,
    fill: { color: C.border }, line: { color: C.border },
  });

  footer(s, 3);
}

// ─── 04: Survey Overview ──────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("調査概要", {
    x: 0.55, y: 0.42, w: 4, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  const items = [
    { label: "調査対象エリア", val: "大阪府 高槻市周辺" },
    { label: "調査店舗数", val: "5店舗" },
    { label: "調査方法", val: "Instagram調査・口コミ分析" },
    { label: "調査目的", val: "個人経営パン屋の経営課題を特定する" },
  ];

  items.forEach((item, i) => {
    const y = 1.2 + i * 0.95;
    s.addText(item.label, {
      x: 0.55, y, w: 3.5, h: 0.3,
      fontSize: 10, color: C.beige, bold: true, align: "left",
      fontFace: FONT, margin: 0, charSpacing: 1,
    });
    s.addText(item.val, {
      x: 0.55, y: y + 0.3, w: 5.2, h: 0.45,
      fontSize: 17, color: C.black, align: "left", fontFace: FONT, margin: 0,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y: y + 0.82, w: 5.2, h: 0.02,
      fill: { color: C.border }, line: { color: C.border },
    });
  });

  // Right: viewpoints
  s.addText("調査で見た3つの軸", {
    x: 6.4, y: 1.2, w: 3.3, h: 0.38,
    fontSize: 12, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });
  const vps = ["営業スタイル・販売方法", "在庫・廃棄の管理状況", "集客・情報発信の手段"];
  vps.forEach((vp, i) => {
    s.addText(String(i + 1) + ".", {
      x: 6.4, y: 1.75 + i * 0.88, w: 0.35, h: 0.38,
      fontSize: 20, color: C.orange, bold: true, fontFace: FONT_NUM, margin: 0,
    });
    s.addText(vp, {
      x: 6.8, y: 1.8 + i * 0.88, w: 2.85, h: 0.38,
      fontSize: 13, color: C.black, align: "left", margin: 0,
    });
  });

  footer(s, 4);
}

// ─── 05: Shop List ────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("調査店舗一覧", {
    x: 0.55, y: 0.42, w: 5, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  const shops = [
    { name: "丹青", tags: ["売切れ型", "Instagram集客"] },
    { name: "サニーサイド", tags: ["多品種", "長時間営業"] },
    { name: "乃が美", tags: ["高級食パン特化", "参考情報"] },
    { name: "HILL'S BAKERY", tags: ["地域密着", "常連客中心"] },
    { name: "ベーカリービーチアイランド", tags: ["Instagram集客", "短時間営業"] },
  ];

  shops.forEach((shop, i) => {
    const y = 1.1 + i * 0.87;
    // Number
    s.addText(String(i + 1).padStart(2, "0"), {
      x: 0.55, y: y + 0.05, w: 0.55, h: 0.45,
      fontSize: 14, color: C.border, bold: true, fontFace: FONT_NUM, margin: 0,
    });
    // Name
    s.addText(shop.name, {
      x: 1.15, y, w: 3.6, h: 0.52,
      fontSize: 17, color: C.brown, bold: true, fontFace: FONT, margin: 0,
    });
    // Tags
    let tagX = 1.15;
    shop.tags.forEach((tag) => {
      const tagW = tag.length * 0.155 + 0.28;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: tagX, y: y + 0.54, w: tagW, h: 0.25, rectRadius: 0.04,
        fill: { color: C.light }, line: { color: C.border, width: 0.5 },
      });
      s.addText(tag, {
        x: tagX, y: y + 0.54, w: tagW, h: 0.25,
        fontSize: 9, color: C.beige, align: "center", margin: 0,
      });
      tagX += tagW + 0.1;
    });
    // Divider
    if (i < shops.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.55, y: y + 0.83, w: 8.5, h: 0.015,
        fill: { color: C.border }, line: { color: C.border },
      });
    }
  });

  footer(s, 5);
}

// ─── 06: Comparison Table ──────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("5店舗 比較分析", {
    x: 0.55, y: 0.42, w: 6, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  const headers = ["店舗名", "営業スタイル", "主な集客", "主な課題"];
  const rows = [
    ["丹青", "売切れ型・昼完売", "Instagram", "製造数不足・欠品"],
    ["サニーサイド", "多品種・長時間", "口コミ", "在庫複雑・廃棄ロス"],
    ["乃が美", "高級食パン特化", "ブランド", "参考情報"],
    ["HILL'S BAKERY", "地域密着", "常連客", "売上予測が経験依存"],
    ["ビーチアイランド", "短時間営業", "Instagram", "来店予測困難"],
  ];

  const colW = [1.9, 2.4, 1.6, 2.9];
  const tX = 0.55;
  const rH = 0.42;

  // Header row
  let cx = tX;
  headers.forEach((h, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 1.15, w: colW[i], h: rH,
      fill: { color: C.brown }, line: { color: C.brown },
    });
    s.addText(h, {
      x: cx + 0.08, y: 1.15, w: colW[i] - 0.08, h: rH,
      fontSize: 11, color: C.white, bold: true, align: "left", fontFace: FONT, margin: 0,
    });
    cx += colW[i];
  });

  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? C.white : C.light;
    cx = tX;
    row.forEach((cell, ci) => {
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: 1.15 + rH + ri * rH, w: colW[ci], h: rH,
        fill: { color: bg }, line: { color: C.border, width: 0.5 },
      });
      s.addText(cell, {
        x: cx + 0.08, y: 1.15 + rH + ri * rH, w: colW[ci] - 0.08, h: rH,
        fontSize: 11, color: C.black, align: "left", margin: 0,
      });
      cx += colW[ci];
    });
  });

  s.addText("全店舗に共通 → 製造量の根拠がない", {
    x: 0.55, y: 4.6, w: 8.8, h: 0.4,
    fontSize: 14, color: C.orange, bold: true, align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 6);
}

// ─── 07: Common Issues ────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("調査で発見した 共通課題", {
    x: 0.55, y: 0.42, w: 7, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  // Three issues as large text pairs, horizontal flow
  const issues = [
    { cause: "売切れ", effect: "機会損失" },
    { cause: "廃棄", effect: "利益低下" },
    { cause: "製造量を\n経験で決定", effect: "根拠なし" },
  ];

  issues.forEach((issue, i) => {
    const x = 0.55 + i * 3.1;
    // Cause
    s.addText(issue.cause, {
      x, y: 1.15, w: 2.8, h: 0.75,
      fontSize: 28, color: C.brown, bold: true, align: "center",
      fontFace: FONT, margin: 0,
    });
    // Arrow
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 1.25, y: 1.95, w: 0.3, h: 0.6,
      fill: { color: C.orange }, line: { color: C.orange },
    });
    s.addText("▼", {
      x: x + 1.12, y: 2.5, w: 0.55, h: 0.3,
      fontSize: 14, color: C.orange, align: "center", margin: 0,
    });
    // Effect
    s.addText(issue.effect, {
      x, y: 2.85, w: 2.8, h: 0.65,
      fontSize: 22, color: C.orange, bold: true, align: "center",
      fontFace: FONT, margin: 0,
    });
    // Vertical separator
    if (i < issues.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 2.88, y: 1.1, w: 0.02, h: 2.5,
        fill: { color: C.border }, line: { color: C.border },
      });
    }
  });

  // Bottom conclusion — left-aligned, no box
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 3.85, w: 9.0, h: 0.02,
    fill: { color: C.border }, line: { color: C.border },
  });
  s.addText("これらは全て「製造量が正確に決められない」という一点に起因している", {
    x: 0.55, y: 4.0, w: 9.0, h: 0.48,
    fontSize: 14, color: C.brown, bold: true, align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 7);
}

// ─── 08: Root Cause ──────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("なぜ製造量が決められないのか？", {
    x: 0.55, y: 0.42, w: 8, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  // Left: layered text hierarchy (no boxes, just typography + background fills)
  const layers = [
    { text: "データが存在しない / バラバラに管理", y: 1.15, fs: 12, color: C.gray, bg: null },
    { text: "売上・廃棄・在庫が一元管理されていない", y: 1.75, fs: 14, color: C.beige, bg: null },
    { text: "明日の製造数が決められない", y: 2.45, fs: 20, color: C.white, bg: C.brown },
  ];

  layers.forEach((l) => {
    if (l.bg) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.45, y: l.y - 0.08, w: 5.3, h: 0.62,
        fill: { color: l.bg }, line: { color: l.bg },
      });
    }
    s.addText(l.text, {
      x: 0.55, y: l.y, w: 5.1, h: 0.5,
      fontSize: l.fs, color: l.color, bold: l.bg !== null, align: "left",
      fontFace: FONT, margin: 0,
    });
  });

  // Arrow connecting layers
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.58, w: 0.02, h: 2.1,
    fill: { color: C.border }, line: { color: C.border },
  });

  // Right: plain list, no cards
  s.addText("現場の実態", {
    x: 6.15, y: 1.15, w: 3.5, h: 0.38,
    fontSize: 12, color: C.beige, bold: true, fontFace: FONT, margin: 0, charSpacing: 1,
  });
  const points = [
    "Excelや手書きで管理 → 集計に時間がかかる",
    "昨日の感覚で今日の製造数を決める",
    "売切れ・廃棄のデータが残らない",
  ];
  points.forEach((pt, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.15, y: 1.65 + i * 0.92, w: 0.05, h: 0.42,
      fill: { color: C.border }, line: { color: C.border },
    });
    s.addText(pt, {
      x: 6.3, y: 1.62 + i * 0.92, w: 3.35, h: 0.58,
      fontSize: 13, color: C.black, align: "left", margin: 0, wrap: true,
    });
  });

  footer(s, 8);
}

// ─── 09: Core Issue (dark) ────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.brown };

  s.addText("本質課題", {
    x: 0.55, y: 0.55, w: 4, h: 0.38,
    fontSize: 11, color: C.beige, align: "left", fontFace: FONT,
    margin: 0, charSpacing: 3,
  });

  s.addText([
    { text: "「明日、どの商品を\n何個作ればよいか、\n", options: { color: C.white } },
    { text: "わからない」", options: { color: C.orange } },
  ], {
    x: 0.55, y: 1.1, w: 8.9, h: 3.0,
    fontSize: 44, bold: true, align: "left", fontFace: FONT,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 4.25, w: 9.0, h: 0.02,
    fill: { color: "5A3520" }, line: { color: "5A3520" },
  });

  s.addText("売切れも廃棄も、その根本は「製造量の不確かさ」にある", {
    x: 0.55, y: 4.4, w: 9.0, h: 0.42,
    fontSize: 13, color: "D4B99A", align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 9);
}

// ─── 10: Target ──────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("ターゲット", {
    x: 0.55, y: 0.42, w: 4, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  // Big target statement on left
  s.addText("個人経営\nパン屋", {
    x: 0.55, y: 1.05, w: 4.2, h: 2.6,
    fontSize: 56, color: C.brown, bold: true, align: "left",
    fontFace: FONT, margin: 0, lineSpacingMultiple: 0.88,
  });

  s.addText("製造量を経験と勘で決めている店舗", {
    x: 0.55, y: 3.75, w: 4.5, h: 0.42,
    fontSize: 14, color: C.orange, bold: true, align: "left", fontFace: FONT, margin: 0,
  });

  // Vertical rule
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.0, w: 0.02, h: 3.5,
    fill: { color: C.border }, line: { color: C.border },
  });

  // Right: attributes as plain text pairs
  const attrs = [
    { label: "従業員数", val: "5〜15名" },
    { label: "店舗数", val: "1〜3店舗" },
    { label: "販売スタイル", val: "予約販売なし" },
  ];
  attrs.forEach((a, i) => {
    const y = 1.1 + i * 1.15;
    s.addText(a.label, {
      x: 5.5, y, w: 4.0, h: 0.32,
      fontSize: 10, color: C.beige, bold: true, fontFace: FONT, margin: 0, charSpacing: 1,
    });
    s.addText(a.val, {
      x: 5.5, y: y + 0.32, w: 4.0, h: 0.58,
      fontSize: 24, color: C.black, bold: true, fontFace: FONT, margin: 0,
    });
    if (i < attrs.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 5.5, y: y + 1.0, w: 4.0, h: 0.02,
        fill: { color: C.border }, line: { color: C.border },
      });
    }
  });

  footer(s, 10);
}

// ─── 11: Persona ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };

  // Left: persona summary — editorial style
  s.addText("Persona", {
    x: 0.55, y: 0.42, w: 4, h: 0.45,
    fontSize: 11, color: C.beige, bold: true, fontFace: FONT_NUM,
    margin: 0, charSpacing: 3,
  });

  s.addText("田中 誠 さん（仮）", {
    x: 0.55, y: 0.95, w: 4.5, h: 0.65,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });
  s.addText("45歳 / 大阪府 / パン屋オーナー歴15年", {
    x: 0.55, y: 1.65, w: 4.5, h: 0.35,
    fontSize: 12, color: C.gray, fontFace: FONT, margin: 0,
  });

  // Pain points — left, no boxes, just typography with side marks
  s.addText("課題・悩み", {
    x: 0.55, y: 2.25, w: 4.0, h: 0.32,
    fontSize: 10, color: C.beige, bold: true, fontFace: FONT, margin: 0, charSpacing: 1,
  });
  const pains = [
    "毎朝、製造数を感覚で決めていてストレスを感じる",
    "夕方に売れ残ったパンを捨てるたびに罪悪感がある",
    "売切れで帰るお客様を見るたびに悔しい思いをする",
  ];
  pains.forEach((pain, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y: 2.68 + i * 0.72, w: 0.05, h: 0.45,
      fill: { color: C.orange }, line: { color: C.orange },
    });
    s.addText(pain, {
      x: 0.72, y: 2.65 + i * 0.72, w: 4.0, h: 0.55,
      fontSize: 13, color: C.black, align: "left", fontFace: FONT, margin: 0, wrap: true,
    });
  });

  // Right: quote pullout — large typography
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.15, y: 0.0, w: 4.85, h: H,
    fill: { color: C.brown }, line: { color: C.brown },
  });
  s.addText("「感覚で決めた\n製造数が\n毎日外れる」", {
    x: 5.35, y: 1.0, w: 4.45, h: 3.2,
    fontSize: 30, color: C.white, bold: true, align: "left",
    fontFace: FONT, margin: 0, lineSpacingMultiple: 1.2,
  });
  s.addText("パン屋オーナーの共通の声", {
    x: 5.35, y: 4.3, w: 4.45, h: 0.38,
    fontSize: 11, color: C.beige, align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 11);
}

// ─── 12: Service Overview ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.brown };

  s.addText("Bakery Hub とは", {
    x: 0.55, y: 0.42, w: 6, h: 0.5,
    fontSize: 13, color: C.beige, fontFace: FONT, margin: 0, charSpacing: 1,
  });

  s.addText("勘に頼るパン屋経営を、\nデータ経営へ", {
    x: 0.55, y: 1.0, w: 5.5, h: 2.2,
    fontSize: 36, color: C.white, bold: true, align: "left",
    fontFace: FONT, margin: 0, lineSpacingMultiple: 1.1,
  });

  // Three features — right side, stacked text (no cards)
  const feats = [
    { n: "01", title: "データ一元管理", desc: "売上・廃棄・在庫を一つの画面で把握" },
    { n: "02", title: "需要予測", desc: "曜日・時間帯から翌日の需要を算出" },
    { n: "03", title: "製造計画", desc: "推奨製造数をそのまま製造指示に変換" },
  ];

  feats.forEach((f, i) => {
    const y = 0.55 + i * 1.55;
    s.addText(f.n, {
      x: 6.3, y, w: 0.6, h: 0.45,
      fontSize: 13, color: C.orange, bold: true, fontFace: FONT_NUM, margin: 0,
    });
    s.addText(f.title, {
      x: 6.95, y, w: 2.8, h: 0.45,
      fontSize: 16, color: C.white, bold: true, fontFace: FONT, margin: 0,
    });
    s.addText(f.desc, {
      x: 6.95, y: y + 0.48, w: 2.8, h: 0.42,
      fontSize: 12, color: "D4B99A", fontFace: FONT, margin: 0,
    });
    if (i < feats.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 6.3, y: y + 1.05, w: 3.4, h: 0.02,
        fill: { color: "5A3520" }, line: { color: "5A3520" },
      });
    }
  });

  // Vertical rule between left and right
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.1, y: 0.45, w: 0.02, h: 4.6,
    fill: { color: "5A3520" }, line: { color: "5A3520" },
  });

  footer(s, 12);
}

// ─── 13: How to Solve ────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("どう解決するか", {
    x: 0.55, y: 0.42, w: 6, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  const steps = [
    { n: "1", title: "データ収集", desc: "売上・廃棄・在庫を毎日入力" },
    { n: "2", title: "分析", desc: "曜日・時間帯・商品別のパターンを自動学習" },
    { n: "3", title: "予測", desc: "翌日の推奨製造数を商品別に表示" },
    { n: "4", title: "製造計画", desc: "そのまま明日の製造指示として活用", highlight: true },
  ];

  steps.forEach((step, i) => {
    const x = 0.45 + i * 2.35;
    // Step number — large
    s.addText(step.n, {
      x, y: 1.2, w: 2.1, h: 1.0,
      fontSize: 52, color: step.highlight ? C.orange : C.border,
      bold: true, align: "left", fontFace: FONT_NUM, margin: 0,
    });
    s.addText(step.title, {
      x, y: 2.28, w: 2.1, h: 0.45,
      fontSize: 16, color: step.highlight ? C.orange : C.brown,
      bold: true, align: "left", fontFace: FONT, margin: 0,
    });
    s.addText(step.desc, {
      x, y: 2.78, w: 2.1, h: 0.85,
      fontSize: 11, color: C.gray, align: "left", margin: 0, wrap: true,
    });
    // Connector arrow
    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + 2.0, y: 1.6, w: 0.35, h: 0.55,
        fontSize: 22, color: C.border, align: "center", margin: 0,
      });
    }
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 4.1, w: 9.1, h: 0.02,
    fill: { color: C.border }, line: { color: C.border },
  });
  s.addText("入力は1日5分。朝には製造計画が自動で出来上がっている", {
    x: 0.55, y: 4.22, w: 9.0, h: 0.4,
    fontSize: 13, color: C.gray, align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 13);
}

// ─── 14: MVP Features ────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("MVP機能一覧", {
    x: 0.55, y: 0.42, w: 5, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  const features = [
    { title: "商品別売上分析", desc: "どの商品が売れているかを可視化" },
    { title: "曜日別分析", desc: "曜日ごとの売上トレンドを把握" },
    { title: "時間帯別分析", desc: "ピーク時間帯を特定" },
    { title: "売切れ分析", desc: "機会損失の大きい商品を特定" },
    { title: "廃棄分析", desc: "無駄の多い商品・時間帯を把握" },
    { title: "製造計画管理", desc: "推奨製造数の表示と調整" },
    { title: "ダッシュボード", desc: "経営状況をワンビューで確認" },
    { title: "在庫管理", desc: "リアルタイムの在庫状況把握" },
  ];

  // Two columns, list style (no boxes)
  const colItems = [features.slice(0, 4), features.slice(4)];
  colItems.forEach((col, ci) => {
    const x = ci === 0 ? 0.55 : 5.3;
    col.forEach((f, i) => {
      const y = 1.15 + i * 0.98;
      // Dot
      s.addShape(pres.shapes.OVAL, {
        x: x, y: y + 0.12, w: 0.12, h: 0.12,
        fill: { color: C.orange }, line: { color: C.orange },
      });
      s.addText(f.title, {
        x: x + 0.22, y, w: 4.35, h: 0.38,
        fontSize: 14, color: C.brown, bold: true, fontFace: FONT, margin: 0,
      });
      s.addText(f.desc, {
        x: x + 0.22, y: y + 0.38, w: 4.35, h: 0.32,
        fontSize: 11, color: C.gray, margin: 0,
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.22, y: y + 0.78, w: 4.3, h: 0.015,
        fill: { color: C.border }, line: { color: C.border },
      });
    });
  });

  // Vertical divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.05, y: 1.1, w: 0.02, h: 3.8,
    fill: { color: C.border }, line: { color: C.border },
  });

  footer(s, 14);
}

// ─── 15: Screen Image ────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("画面イメージ  —  ダッシュボード", {
    x: 0.55, y: 0.42, w: 8, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  // Mock UI — no rounded rect wrapping, just the inner elements
  const mX = 0.55, mY = 1.15, mW = 8.5, mH = 3.9;

  // Thin border around the mock
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX, y: mY, w: mW, h: mH,
    fill: { color: C.light }, line: { color: C.border, width: 1 },
  });

  // Header bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX, y: mY, w: mW, h: 0.4,
    fill: { color: C.brown }, line: { color: C.brown },
  });
  s.addText("Bakery Hub  —  ダッシュボード", {
    x: mX + 0.2, y: mY + 0.04, w: mW - 0.4, h: 0.34,
    fontSize: 11, color: C.white, align: "left", margin: 0,
  });

  // KPI row — minimal, no inner card border
  const kpis = [
    { label: "本日の売上", val: "¥48,200" },
    { label: "廃棄数", val: "3個" },
    { label: "売切れ商品", val: "2品" },
  ];
  kpis.forEach((kpi, i) => {
    const kx = mX + 0.2 + i * 2.7;
    s.addShape(pres.shapes.RECTANGLE, {
      x: kx, y: mY + 0.5, w: 2.5, h: 0.75,
      fill: { color: C.white }, line: { color: C.border, width: 0.5 },
    });
    s.addText(kpi.label, {
      x: kx + 0.1, y: mY + 0.54, w: 2.3, h: 0.25,
      fontSize: 9, color: C.gray, align: "left", margin: 0,
    });
    s.addText(kpi.val, {
      x: kx + 0.1, y: mY + 0.78, w: 2.3, h: 0.4,
      fontSize: 18, color: C.brown, bold: true, align: "left", fontFace: FONT_NUM, margin: 0,
    });
  });

  // Graph area
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX + 0.2, y: mY + 1.38, w: 8.1, h: 1.15,
    fill: { color: C.white }, line: { color: C.border, width: 0.5 },
  });
  s.addText("時間帯別売上グラフ", {
    x: mX + 0.3, y: mY + 1.55, w: 4, h: 0.4,
    fontSize: 11, color: C.gray, align: "left", margin: 0,
  });
  // Simple bar chart mockup
  const barData = [0.3, 0.5, 0.8, 1.0, 0.9, 0.6, 0.4];
  barData.forEach((h2, i) => {
    const bx = mX + 3.5 + i * 0.65;
    const bH = h2 * 0.7;
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: mY + 1.44 + (0.75 - bH), w: 0.45, h: bH,
      fill: { color: C.beige }, line: { color: C.beige },
    });
  });

  // Recommendation row
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX + 0.2, y: mY + 2.65, w: 8.1, h: 0.9,
    fill: { color: C.white }, line: { color: C.border, width: 0.5 },
  });
  s.addText("明日の推奨製造数", {
    x: mX + 0.3, y: mY + 2.7, w: 2.5, h: 0.3,
    fontSize: 9, color: C.gray, align: "left", margin: 0,
  });
  s.addText("クロワッサン  45個  /  食パン  20個  /  メロンパン  30個", {
    x: mX + 0.3, y: mY + 2.98, w: 7.5, h: 0.42,
    fontSize: 13, color: C.brown, bold: true, align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 15);
}

// ─── 16: Differentiation ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("なぜ Bakery Hub が必要か", {
    x: 0.55, y: 0.42, w: 7, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  const headers = ["観点", "既存の方法", "Bakery Hub"];
  const rows2 = [
    ["データ管理", "Excel・手書き（バラバラ）", "一元管理・自動集計"],
    ["製造量決定", "経験と勘", "データに基づく推奨値"],
    ["廃棄・売切れ", "気づいたら手遅れ", "翌日の予測で事前対策"],
    ["分析工数", "毎日手作業（1〜2時間）", "自動・ゼロ工数"],
  ];

  const colW2 = [2.2, 3.2, 3.2];
  const tX = 0.55;
  const rH = 0.48;

  let cx = tX;
  headers.forEach((h, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 1.12, w: colW2[i], h: rH,
      fill: { color: C.brown }, line: { color: C.brown },
    });
    s.addText(h, {
      x: cx + 0.1, y: 1.12, w: colW2[i] - 0.1, h: rH,
      fontSize: 12, color: C.white, bold: true, align: "left", fontFace: FONT, margin: 0,
    });
    cx += colW2[i];
  });

  rows2.forEach((row, ri) => {
    cx = tX;
    row.forEach((cell, ci) => {
      const bg = ci === 2 ? "F0F5F0" : (ri % 2 === 0 ? C.white : C.light);
      s.addShape(pres.shapes.RECTANGLE, {
        x: cx, y: 1.12 + rH + ri * rH, w: colW2[ci], h: rH,
        fill: { color: bg }, line: { color: C.border, width: 0.5 },
      });
      s.addText(cell, {
        x: cx + 0.1, y: 1.12 + rH + ri * rH, w: colW2[ci] - 0.12, h: rH,
        fontSize: 12, color: ci === 1 ? "993333" : (ci === 2 ? "2A6B3F" : C.black),
        align: "left", margin: 0,
      });
      cx += colW2[ci];
    });
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 4.35, w: 9.0, h: 0.02,
    fill: { color: C.border }, line: { color: C.border },
  });
  s.addText("単なる在庫管理ではなく、需要予測 x 製造計画 x 廃棄削減を一体で解決する", {
    x: 0.55, y: 4.48, w: 9.0, h: 0.4,
    fontSize: 13, color: C.orange, bold: true, align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 16);
}

// ─── 17: Pricing ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("料金モデル", {
    x: 0.55, y: 0.42, w: 5, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  const plans = [
    {
      name: "Light", jpName: "ライト", price: "2,980",
      features: ["ダッシュボード", "商品別売上分析", "曜日別分析"],
      highlight: false,
    },
    {
      name: "Standard", jpName: "スタンダード", price: "4,980",
      features: ["ライトの全機能", "時間帯別分析", "売切れ・廃棄分析", "製造計画管理"],
      highlight: true,
    },
    {
      name: "Pro", jpName: "プロ", price: "7,980",
      features: ["スタンダードの全機能", "多店舗対応", "スタッフ管理", "CSVエクスポート"],
      highlight: false,
    },
  ];

  plans.forEach((plan, i) => {
    const x = 0.45 + i * 3.15;
    const bg = plan.highlight ? C.brown : C.white;
    const tc = plan.highlight ? C.white : C.brown;
    const gc = plan.highlight ? "D4B99A" : C.gray;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.1, w: 3.0, h: 4.1,
      fill: { color: bg }, line: { color: plan.highlight ? C.brown : C.border, width: 1 },
    });

    if (plan.highlight) {
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: 1.1, w: 3.0, h: 0.08,
        fill: { color: C.orange }, line: { color: C.orange },
      });
      s.addText("主力プラン", {
        x, y: 1.18, w: 3.0, h: 0.3,
        fontSize: 9, color: C.beige, align: "center", fontFace: FONT, margin: 0, charSpacing: 2,
      });
    }

    const nameY = plan.highlight ? 1.52 : 1.25;
    s.addText(plan.name, {
      x, y: nameY, w: 3.0, h: 0.35,
      fontSize: 11, color: plan.highlight ? C.beige : C.gray,
      align: "center", fontFace: FONT_NUM, margin: 0, charSpacing: 2,
    });

    s.addText("¥" + plan.price, {
      x, y: nameY + 0.38, w: 3.0, h: 0.9,
      fontSize: 44, color: tc, bold: true, align: "center",
      fontFace: FONT_NUM, margin: 0,
    });
    s.addText("/ 月（税込）", {
      x, y: nameY + 1.32, w: 3.0, h: 0.28,
      fontSize: 10, color: gc, align: "center", margin: 0,
    });

    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.4, y: nameY + 1.7, w: 2.2, h: 0.02,
      fill: { color: plan.highlight ? "5A3520" : C.border },
      line: { color: plan.highlight ? "5A3520" : C.border },
    });

    plan.features.forEach((feat, fi) => {
      s.addText("  " + feat, {
        x: x + 0.2, y: nameY + 1.85 + fi * 0.42, w: 2.6, h: 0.38,
        fontSize: 12, color: gc, align: "left", margin: 0,
      });
    });
  });

  footer(s, 17);
}

// ─── 18: Roadmap ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("開発ロードマップ", {
    x: 0.55, y: 0.42, w: 6, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  // Horizontal timeline — text-driven, no big cards
  const phases = [
    { phase: "Phase 1", label: "MVP", period: "〜2026年Q3", items: ["売上・廃棄入力", "曜日別分析", "ダッシュボード"], active: true },
    { phase: "Phase 2", label: "需要予測", period: "〜2026年Q4", items: ["製造推奨数", "時間帯分析", "売切れ分析"], active: false },
    { phase: "Phase 3", label: "拡張", period: "〜2027年Q1", items: ["多店舗対応", "スタッフ管理", "API連携"], active: false },
    { phase: "Phase 4", label: "スケール", period: "〜2027年Q3", items: ["AI予測強化", "POSレジ連携", "全国展開"], active: false },
  ];

  // Timeline base line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 2.02, w: 8.9, h: 0.04,
    fill: { color: C.border }, line: { color: C.border },
  });

  phases.forEach((ph, i) => {
    const x = 0.55 + i * 2.3;
    const dotColor = ph.active ? C.orange : C.border;

    // Timeline dot
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.8, y: 1.88, w: 0.3, h: 0.3,
      fill: { color: dotColor }, line: { color: dotColor },
    });

    // Phase label above line
    s.addText(ph.phase, {
      x, y: 1.18, w: 2.2, h: 0.28,
      fontSize: 10, color: ph.active ? C.orange : C.gray,
      bold: ph.active, align: "center", fontFace: FONT_NUM, margin: 0,
    });
    s.addText(ph.label, {
      x, y: 1.48, w: 2.2, h: 0.38,
      fontSize: 16, color: ph.active ? C.brown : C.gray,
      bold: ph.active, align: "center", fontFace: FONT, margin: 0,
    });

    // Period and items below line
    s.addText(ph.period, {
      x, y: 2.22, w: 2.2, h: 0.3,
      fontSize: 10, color: C.gray, align: "center", margin: 0,
    });
    ph.items.forEach((item, ii) => {
      s.addText("・ " + item, {
        x, y: 2.6 + ii * 0.45, w: 2.2, h: 0.38,
        fontSize: 12, color: ph.active ? C.black : C.gray,
        align: "center", margin: 0,
      });
    });
  });

  footer(s, 18);
}

// ─── 19: Expected Impact ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("Bakery Hub 導入で期待できる効果", {
    x: 0.55, y: 0.42, w: 9, h: 0.55,
    fontSize: 26, color: C.brown, bold: true, fontFace: FONT, margin: 0,
  });

  // Three effects — large number, label, description. No cards, no borders.
  const effects = [
    { big: "最大\n30%", label: "廃棄ロス削減", desc: "データに基づく製造数で\n不要な廃棄を削減" },
    { big: "欠品\nゼロへ", label: "売上機会の最大化", desc: "需要予測で売切れによる\n機会損失を防止" },
    { big: "1日\n5分", label: "管理工数の削減", desc: "自動集計・分析で\nオーナーの時間を解放" },
  ];

  effects.forEach((ef, i) => {
    const x = 0.55 + i * 3.15;

    s.addText(ef.big, {
      x, y: 1.1, w: 2.9, h: 1.8,
      fontSize: 48, color: C.orange, bold: true, align: "left",
      fontFace: FONT_NUM, margin: 0, lineSpacingMultiple: 0.9,
    });
    s.addText(ef.label, {
      x, y: 2.98, w: 2.9, h: 0.42,
      fontSize: 15, color: C.brown, bold: true, align: "left",
      fontFace: FONT, margin: 0,
    });
    s.addText(ef.desc, {
      x, y: 3.45, w: 2.9, h: 0.9,
      fontSize: 12, color: C.gray, align: "left", margin: 0, wrap: true,
    });

    if (i < effects.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 3.0, y: 1.1, w: 0.02, h: 3.2,
        fill: { color: C.border }, line: { color: C.border },
      });
    }
  });

  s.addText("※数値は試算・参考値です", {
    x: 0.55, y: 5.1, w: 9.0, h: 0.25,
    fontSize: 9, color: C.gray, align: "left", margin: 0,
  });

  footer(s, 19);
}

// ─── 20: Closing ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.brown };

  // Large typography closing — asymmetric
  s.addText("Bakery\nHub", {
    x: 0.55, y: 0.4, w: 6.0, h: 3.0,
    fontSize: 88, color: C.white, bold: true, align: "left",
    fontFace: FONT, margin: 0, lineSpacingMultiple: 0.88,
  });

  s.addText("勘に頼るパン屋経営を、データ経営へ", {
    x: 0.55, y: 3.5, w: 6.5, h: 0.45,
    fontSize: 16, color: C.beige, align: "left", fontFace: FONT, margin: 0,
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.8, y: 0.0, w: 0.03, h: H,
    fill: { color: "5A3520" }, line: { color: "5A3520" },
  });

  // Right: summary bullets — plain text
  const bullets = [
    "需要予測 x 製造計画 x\n廃棄削減を一体で解決",
    "個人経営パン屋に\n特化した専用SaaS",
    "月額4,980円から\n始められる低リスク導入",
  ];
  bullets.forEach((b, i) => {
    s.addText(b, {
      x: 7.05, y: 0.6 + i * 1.55, w: 2.7, h: 1.3,
      fontSize: 14, color: i === 0 ? C.white : "D4B99A",
      bold: i === 0, align: "left", fontFace: FONT, margin: 0, wrap: true,
    });
    if (i < bullets.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 7.05, y: 0.6 + (i + 1) * 1.55 - 0.08, w: 2.65, h: 0.02,
        fill: { color: "5A3520" }, line: { color: "5A3520" },
      });
    }
  });

  s.addText("一緒に、データで動くパン屋をつくりましょう。", {
    x: 0.55, y: 4.15, w: 6.0, h: 0.45,
    fontSize: 14, color: C.orange, align: "left", fontFace: FONT, margin: 0,
  });

  footer(s, 20);
}

pres.writeFile({ fileName: "bakery-hub/Bakery_Hub_企画提案資料.pptx" })
  .then(() => console.log("Done."))
  .catch(err => console.error(err));

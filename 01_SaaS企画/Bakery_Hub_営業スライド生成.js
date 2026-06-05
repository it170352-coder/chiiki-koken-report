// Bakery Hub 営業提案スライド生成スクリプト
// パン屋オーナー向け。create_slides.js をお手本に、pptxgenjs で営業用 pptx を出力する。
// 配色はアプリ(Bakery Hub)と同じアンバー/パン系で統一。

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Bakery Hub 営業提案資料";

// ── カラーパレット（パン・アンバー系）──
const C = {
  darkBg:   "4A2C2A",  // 濃いカカオブラウン（表紙・結び）
  primary:  "B45309",  // アンバー700（メイン）
  accent:   "D9A066",  // こんがりキャラメル
  light:    "FDF6EC",  // クリーム
  sand:     "F5E6D3",  // 淡いベージュ
  white:    "FFFFFF",
  textDark: "3B2A23",
  textMid:  "6B4F3F",
  textGray: "9C8676",
};

const makeShadow = () => ({
  type: "outer", color: "000000", opacity: 0.10, blur: 8, offset: 3, angle: 135,
});

// 共通: セクション見出し（上部ラベル＋下線）
function sectionHeader(s, label) {
  s.addText(label, {
    x: 0.5, y: 0.35, w: 9, h: 0.55,
    fontSize: 13, color: C.primary, bold: true, align: "left", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.95, w: 9, h: 0.04,
    fill: { color: C.sand }, line: { color: C.sand },
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 1: 表紙
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.4, w: 3.6, h: 0.42,
    fill: { color: C.accent }, line: { color: C.accent },
  });
  s.addText("パン屋さんのための業務管理SaaS", {
    x: 0.5, y: 1.4, w: 3.6, h: 0.42,
    fontSize: 12, color: C.darkBg, bold: true, align: "center", valign: "middle", margin: 0,
  });

  s.addText("Bakery Hub", {
    x: 0.5, y: 2.0, w: 8.5, h: 1.2,
    fontSize: 54, color: C.white, bold: true, align: "left", valign: "top",
  });

  s.addText("予約・顧客・在庫を、ひとつの画面で。", {
    x: 0.52, y: 3.25, w: 8.5, h: 0.7,
    fontSize: 22, color: C.accent, bold: false, align: "left", valign: "top",
  });

  s.addText("高槻市内の個人経営パン屋さんへ", {
    x: 0.52, y: 4.6, w: 6, h: 0.5,
    fontSize: 14, color: C.sand, align: "left",
  });
  s.addText("2026.06", {
    x: 7.5, y: 4.8, w: 2.2, h: 0.5,
    fontSize: 14, color: C.accent, align: "right",
  });

  s.addShape(pres.shapes.OVAL, {
    x: 7.7, y: -0.6, w: 3.4, h: 3.4,
    fill: { color: C.primary, transparency: 75 }, line: { color: C.primary, transparency: 75 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 8.4, y: 1.9, w: 2.0, h: 2.0,
    fill: { color: C.accent, transparency: 82 }, line: { color: C.accent, transparency: 82 },
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 2: こんなお悩みありませんか？
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  sectionHeader(s, "こんなお悩み、ありませんか？");

  const worries = [
    { icon: "📒", title: "予約がバラバラ", desc: "電話・Instagram DM・ノートに散らばり、毎朝の確認に時間がかかる" },
    { icon: "🧠", title: "常連さんは記憶頼み", desc: "「あの方は何が好きだったか」がオーナーの頭の中だけにある" },
    { icon: "🥐", title: "何個焼けばいい？", desc: "製造数はカン頼み。焼きすぎれば廃棄、足りなければ売り逃し" },
    { icon: "📞", title: "問い合わせで手が止まる", desc: "「◯◯ありますか？」の電話のたびに製造・接客が中断する" },
  ];

  const pos = [[0.5, 1.25], [5.1, 1.25], [0.5, 3.4], [5.1, 3.4]];
  worries.forEach((w, i) => {
    const [x, y] = pos[i];
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.4, h: 1.9,
      fill: { color: C.white }, line: { color: C.sand }, shadow: makeShadow(),
    });
    s.addText(`${w.icon}  ${w.title}`, {
      x: x + 0.25, y: y + 0.2, w: 3.9, h: 0.5,
      fontSize: 17, color: C.primary, bold: true, align: "left", valign: "middle", margin: 0,
    });
    s.addText(w.desc, {
      x: x + 0.25, y: y + 0.8, w: 3.95, h: 0.95,
      fontSize: 13, color: C.textMid, align: "left", valign: "top",
      lineSpacingMultiple: 1.3,
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 3: その悩み、利益を直接削っています
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  sectionHeader(s, "その悩み、実は利益を直接削っています");

  const facts = [
    { big: "日持ち\nしない", title: "売れ残りはそのまま廃棄", desc: "パンは翌日に持ち越せない。焼きすぎた分は、ほぼそのまま損失になる" },
    { big: "月収\n約30万", title: "もともと利益が薄い", desc: "個人パン屋オーナーの月収は平均約30万円。小さなロスが経営に響く" },
    { big: "中断\n＝損失", title: "時間のロスも見えない損", desc: "製造・接客の中断は、本来作れたパン・売れたパンを減らしている" },
  ];

  facts.forEach((f, i) => {
    const x = 0.5 + i * 3.07;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.25, w: 2.85, h: 3.9,
      fill: { color: C.light }, line: { color: C.sand }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.25, w: 2.85, h: 1.3,
      fill: { color: C.primary }, line: { color: C.primary },
    });
    s.addText(f.big, {
      x, y: 1.25, w: 2.85, h: 1.3,
      fontSize: 22, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
      lineSpacingMultiple: 1.0,
    });
    s.addText(f.title, {
      x: x + 0.2, y: 2.75, w: 2.45, h: 0.7,
      fontSize: 15, color: C.textDark, bold: true, align: "left", valign: "top",
      lineSpacingMultiple: 1.1,
    });
    s.addText(f.desc, {
      x: x + 0.2, y: 3.5, w: 2.5, h: 1.5,
      fontSize: 12, color: C.textMid, align: "left", valign: "top",
      lineSpacingMultiple: 1.35,
    });
  });

  s.addText("出典：マネーフォワード クラウド「パン屋の開業」（月商・オーナー月収の目安）。数値は一般的な目安であり、店舗により異なります。", {
    x: 0.5, y: 5.25, w: 9, h: 0.3,
    fontSize: 9, color: C.textGray, align: "left",
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 4: Bakery Hub が解決します
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  sectionHeader(s, "Bakery Hub が解決します");

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.25, w: 0.18, h: 2.9,
    fill: { color: C.accent }, line: { color: C.accent },
  });
  s.addText("「予約・顧客・商品・在庫」を\nひとつのクラウドにまとめ、\nバラバラの管理と、頭の中の記憶頼みを\nまとめて解消します。", {
    x: 0.95, y: 1.25, w: 8.6, h: 2.9,
    fontSize: 25, color: C.textDark, align: "left", valign: "middle",
    lineSpacingMultiple: 1.45,
  });

  const kws = [
    { label: "集約", desc: "情報がひとつの画面に" },
    { label: "連動", desc: "予約・在庫・売上が自動でつながる" },
    { label: "かんたん", desc: "スマホ世代の店長がすぐ使える" },
  ];
  kws.forEach((kw, i) => {
    const x = 0.5 + i * 3.17;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.4, w: 2.9, h: 0.95,
      fill: { color: C.primary }, line: { color: C.primary }, shadow: makeShadow(),
    });
    s.addText([
      { text: kw.label, options: { bold: true, breakLine: true, fontSize: 16 } },
      { text: kw.desc, options: { fontSize: 11, bold: false } },
    ], {
      x, y: 4.4, w: 2.9, h: 0.95,
      color: C.white, align: "center", valign: "middle",
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 5: ビフォー → アフター
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  sectionHeader(s, "導入すると、毎日がこう変わります");

  const rows = [
    ["予約管理", "電話・DM・メモに分散", "1画面に集約、状態がひと目で分かる"],
    ["製造数の決定", "毎朝カン頼み", "予約数＋定番の販売数を自動集計"],
    ["常連さん対応", "オーナーの記憶頼み", "顧客カルテで誰でも同じ対応"],
    ["在庫・廃棄", "記録していない", "販売数・廃棄数を毎日記録して分析"],
    ["スタッフ共有", "口頭・紙で漏れる", "クラウドでリアルタイム共有"],
  ];

  // ヘッダ行
  const colX = [0.5, 2.7, 5.6];
  const colW = [2.1, 2.8, 4.1];
  const heads = ["業務", "いままで", "Bakery Hub 導入後"];
  heads.forEach((h, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: colX[i], y: 1.2, w: colW[i], h: 0.55,
      fill: { color: i === 2 ? C.primary : C.sand }, line: { color: C.white },
    });
    s.addText(h, {
      x: colX[i], y: 1.2, w: colW[i], h: 0.55,
      fontSize: 13, bold: true, color: i === 2 ? C.white : C.textDark,
      align: "center", valign: "middle", margin: 0,
    });
  });

  rows.forEach((r, ri) => {
    const y = 1.75 + ri * 0.68;
    const bg = ri % 2 === 0 ? C.light : C.white;
    r.forEach((cell, ci) => {
      s.addShape(pres.shapes.RECTANGLE, {
        x: colX[ci], y, w: colW[ci], h: 0.68,
        fill: { color: ci === 2 ? "FBEAD2" : bg }, line: { color: C.sand },
      });
      s.addText(cell, {
        x: colX[ci] + 0.12, y, w: colW[ci] - 0.2, h: 0.68,
        fontSize: ci === 0 ? 13 : 12,
        bold: ci === 0,
        color: ci === 2 ? C.primary : C.textMid,
        align: ci === 0 ? "center" : "left", valign: "middle", margin: 0,
      });
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 6: 主な機能
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  sectionHeader(s, "主な機能");

  const feats = [
    { icon: "🗓️", title: "予約・取り置き管理", desc: "受取日時・商品・お客様を登録し、準備〜受取をステータスで管理" },
    { icon: "👤", title: "顧客カルテ", desc: "連絡先・購入履歴・好み・アレルギーをメモ。検索もすぐ" },
    { icon: "🍞", title: "商品管理", desc: "商品名・カテゴリ・価格・販売状況をまとめて管理" },
    { icon: "📦", title: "在庫・廃棄記録", desc: "製造数・販売数・廃棄数を入力すると残数を自動計算" },
    { icon: "📊", title: "ダッシュボード", desc: "本日の予約・売上・人気商品・在庫・顧客数をひと目で把握" },
  ];

  // 上段3つ・下段2つ
  const pos = [[0.5, 1.25], [3.57, 1.25], [6.64, 1.25], [2.0, 3.45], [5.5, 3.45]];
  feats.forEach((f, i) => {
    const [x, y] = pos[i];
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.86, h: 2.0,
      fill: { color: C.white }, line: { color: C.sand }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.86, h: 0.12,
      fill: { color: C.accent }, line: { color: C.accent },
    });
    s.addText(`${f.icon}  ${f.title}`, {
      x: x + 0.18, y: y + 0.28, w: 2.5, h: 0.6,
      fontSize: 14, color: C.primary, bold: true, align: "left", valign: "middle", margin: 0,
    });
    s.addText(f.desc, {
      x: x + 0.18, y: y + 0.92, w: 2.55, h: 1.0,
      fontSize: 12, color: C.textMid, align: "left", valign: "top",
      lineSpacingMultiple: 1.3,
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 7: 他のツールとの違い
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  sectionHeader(s, "レジ・POSアプリとの違い");

  // 左：一般的なPOS  右：Bakery Hub
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.25, w: 4.3, h: 3.9,
    fill: { color: C.light }, line: { color: C.sand }, shadow: makeShadow(),
  });
  s.addText("一般的なレジ・POSアプリ", {
    x: 0.5, y: 1.45, w: 4.3, h: 0.5,
    fontSize: 15, color: C.textGray, bold: true, align: "center", margin: 0,
  });
  s.addText(
    [
      "会計・売上の集計が中心",
      "予約・取り置きは苦手なことが多い",
      "常連さんの好みは残らない",
      "多機能で、かえって複雑になりがち",
    ].map((t, i, arr) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1, fontSize: 14, color: C.textMid } })),
    { x: 0.85, y: 2.1, w: 3.7, h: 2.8, valign: "top", paraSpaceAfter: 10 }
  );

  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: 1.25, w: 4.3, h: 3.9,
    fill: { color: C.primary }, line: { color: C.primary }, shadow: makeShadow(),
  });
  s.addText("Bakery Hub", {
    x: 5.2, y: 1.45, w: 4.3, h: 0.5,
    fontSize: 16, color: C.white, bold: true, align: "center", margin: 0,
  });
  s.addText(
    [
      "予約・取り置きが中核機能",
      "常連さんの購入傾向・メモを蓄積",
      "パン屋の「売切れ・予約」に最適化",
      "IT が苦手な店長でも初日から使える",
    ].map((t, i, arr) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1, fontSize: 14, color: C.white } })),
    { x: 5.55, y: 2.1, w: 3.7, h: 2.8, valign: "top", paraSpaceAfter: 10 }
  );

  s.addText("※ 市場の全ツールを調査したものではなく、代表的なPOSアプリとの比較です。", {
    x: 0.5, y: 5.25, w: 9, h: 0.3,
    fontSize: 9, color: C.textGray, align: "left",
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 8: 料金プラン
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  sectionHeader(s, "料金プラン（想定）");

  const plans = [
    {
      name: "スタータープラン", price: "月額 9,800円", target: "まず試したい1店舗向け",
      items: ["1店舗・利用者3名まで", "予約・顧客・商品・在庫", "ダッシュボード"],
      dark: false,
    },
    {
      name: "スタンダードプラン", price: "月額 19,800円", target: "スタッフと使い込む店舗向け",
      items: ["1店舗・利用者10名まで", "スターターの全機能", "分析レポート（順次追加）"],
      dark: true,
    },
  ];

  plans.forEach((p, i) => {
    const x = 0.9 + i * 4.3;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.25, w: 3.9, h: 3.5,
      fill: { color: p.dark ? C.primary : C.white }, line: { color: C.sand }, shadow: makeShadow(),
    });
    s.addText(p.name, {
      x, y: 1.5, w: 3.9, h: 0.5,
      fontSize: 16, bold: true, color: p.dark ? C.white : C.textDark, align: "center", margin: 0,
    });
    s.addText(p.price, {
      x, y: 2.05, w: 3.9, h: 0.7,
      fontSize: 26, bold: true, color: p.dark ? C.white : C.primary, align: "center", margin: 0,
    });
    s.addText(p.target, {
      x, y: 2.75, w: 3.9, h: 0.4,
      fontSize: 11, color: p.dark ? C.sand : C.textGray, align: "center", margin: 0,
    });
    s.addText(
      p.items.map((t, ii, arr) => ({
        text: t,
        options: { bullet: true, breakLine: ii < arr.length - 1, fontSize: 12, color: p.dark ? C.white : C.textMid },
      })),
      { x: x + 0.45, y: 3.25, w: 3.1, h: 1.35, valign: "top", paraSpaceAfter: 6 }
    );
  });

  s.addText("まずは3カ月の無料トライアルで、いつもの業務がどれだけラクになるかをお試しいただけます。", {
    x: 0.9, y: 4.9, w: 8.2, h: 0.35,
    fontSize: 13, color: C.textDark, bold: true, align: "center",
  });
  s.addText("※ 料金は現時点の想定です。正式な価格は店舗の皆さまのご意見をふまえて決定します。", {
    x: 0.9, y: 5.27, w: 8.2, h: 0.3,
    fontSize: 9, color: C.textGray, align: "center",
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 9: 導入の流れ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  sectionHeader(s, "導入はかんたん 4ステップ");

  const steps = [
    { no: "1", title: "お申し込み", desc: "メール1つで登録。難しい設定は不要" },
    { no: "2", title: "初期設定サポート", desc: "商品・常連さんの登録をこちらがお手伝い" },
    { no: "3", title: "3カ月 無料でお試し", desc: "ふだんの業務でそのまま使って効果を実感" },
    { no: "4", title: "ご継続", desc: "価値を感じたらそのまま継続。合わなければ終了でOK" },
  ];

  steps.forEach((st, i) => {
    const x = 0.5 + i * 2.32;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.7, w: 2.1, h: 2.6,
      fill: { color: C.light }, line: { color: C.sand }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.75, y: 1.95, w: 0.6, h: 0.6,
      fill: { color: C.primary }, line: { color: C.primary },
    });
    s.addText(st.no, {
      x: x + 0.75, y: 1.95, w: 0.6, h: 0.6,
      fontSize: 18, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.title, {
      x: x + 0.1, y: 2.7, w: 1.9, h: 0.5,
      fontSize: 14, color: C.textDark, bold: true, align: "center", valign: "middle", margin: 0,
    });
    s.addText(st.desc, {
      x: x + 0.15, y: 3.2, w: 1.8, h: 1.0,
      fontSize: 11, color: C.textMid, align: "center", valign: "top",
      lineSpacingMultiple: 1.3,
    });
    if (i < steps.length - 1) {
      s.addText("→", {
        x: x + 2.05, y: 2.6, w: 0.32, h: 0.6,
        fontSize: 20, color: C.accent, bold: true, align: "center", valign: "middle", margin: 0,
      });
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 10: クロージング
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  s.addText("まずは無料で、\nいつもの業務をラクにしませんか？", {
    x: 0.6, y: 1.5, w: 8.8, h: 1.8,
    fontSize: 32, color: C.white, bold: true, align: "left", valign: "top",
    lineSpacingMultiple: 1.25,
  });

  s.addText("予約も、常連さんも、在庫も、ひとつの画面で。\nパン作りと接客の時間を、いちばん大切にできるお店へ。", {
    x: 0.62, y: 3.4, w: 8.8, h: 1.0,
    fontSize: 16, color: C.sand, align: "left", valign: "top",
    lineSpacingMultiple: 1.4,
  });

  s.addText("Bakery Hub ／ お問い合わせ：（担当者・連絡先を記入）", {
    x: 0.6, y: 5.15, w: 9.1, h: 0.35,
    fontSize: 11, color: C.textGray, align: "left",
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 出力
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pres.writeFile({ fileName: "/Users/ishida/Desktop/claude code/01_SaaS企画/Bakery_Hub_営業提案資料.pptx" })
  .then(() => console.log("✅ 営業提案資料 PPTX 作成完了"))
  .catch((e) => { console.error("❌ エラー:", e); process.exit(1); });

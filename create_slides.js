const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "高槻地域貢献プロジェクト ロードマップ";

// ── カラーパレット ──
const C = {
  darkBg:   "1C3A2E",  // 深い森の緑 (タイトル・結論bg)
  primary:  "2C6E49",  // 森の緑
  accent:   "52B788",  // エメラルド
  light:    "F0F7F4",  // 薄緑白
  sand:     "E9F2EC",  // 淡いグリーン
  white:    "FFFFFF",
  textDark: "1B2B1F",
  textMid:  "3D5A47",
  textGray: "6B8A76",
};

const makeShadow = () => ({
  type: "outer", color: "000000", opacity: 0.10, blur: 8, offset: 3, angle: 135,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 1: タイトル
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  // 左側の明るいバー
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: C.accent }, line: { color: C.accent }
  });

  // サブタイトルラベル
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.5, w: 2.6, h: 0.4,
    fill: { color: C.accent }, line: { color: C.accent }
  });
  s.addText("地域貢献プロジェクト", {
    x: 0.5, y: 1.5, w: 2.6, h: 0.4,
    fontSize: 12, color: C.darkBg, bold: true, align: "center", valign: "middle", margin: 0,
  });

  // メインタイトル
  s.addText("高槻市\n地域貢献\nロードマップ", {
    x: 0.5, y: 2.0, w: 7.5, h: 2.8,
    fontSize: 46, color: C.white, bold: true, align: "left", valign: "top",
    lineSpacingMultiple: 1.15,
  });

  // 右下 日付
  s.addText("2026.05", {
    x: 7.5, y: 4.8, w: 2.2, h: 0.5,
    fontSize: 14, color: C.accent, align: "right", bold: false,
  });

  // 右側 装飾円
  s.addShape(pres.shapes.OVAL, {
    x: 7.6, y: -0.5, w: 3.2, h: 3.2,
    fill: { color: C.primary, transparency: 70 }, line: { color: C.primary, transparency: 70 }
  });
  s.addShape(pres.shapes.OVAL, {
    x: 8.2, y: 2.0, w: 2.0, h: 2.0,
    fill: { color: C.accent, transparency: 80 }, line: { color: C.accent, transparency: 80 }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 2: ビジョン
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.light };

  // スライドタイトル
  s.addText("ビジョン", {
    x: 0.5, y: 0.35, w: 9, h: 0.55,
    fontSize: 13, color: C.accent, bold: true, align: "left", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.95, w: 9, h: 0.04,
    fill: { color: C.sand }, line: { color: C.sand }
  });

  // 大きな引用ブロック
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.2, w: 0.18, h: 3.2,
    fill: { color: C.accent }, line: { color: C.accent }
  });

  s.addText("高槻市に住む人が\n「必要な情報にすぐアクセスでき、\n地域とつながれる」\nポータルサイトを軸に、\n地域貢献とビジネスの両立を目指す。", {
    x: 0.95, y: 1.2, w: 8.6, h: 3.2,
    fontSize: 26, color: C.textDark, bold: false, align: "left", valign: "middle",
    lineSpacingMultiple: 1.5,
  });

  // 下部キーワード3つ
  const kws = [
    { label: "地域貢献", desc: "住民の暮らしを支える" },
    { label: "情報集約", desc: "高槻の全情報が1カ所に" },
    { label: "ビジネス", desc: "持続可能な収益モデル" },
  ];
  kws.forEach((kw, i) => {
    const x = 0.5 + i * 3.17;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.55, w: 2.9, h: 0.85,
      fill: { color: C.primary }, line: { color: C.primary },
      shadow: makeShadow(),
    });
    s.addText([
      { text: kw.label, options: { bold: true, breakLine: true, fontSize: 15 } },
      { text: kw.desc, options: { fontSize: 11, bold: false } },
    ], {
      x, y: 4.55, w: 2.9, h: 0.85,
      color: C.white, align: "center", valign: "middle",
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 3: 3つの柱
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("3つの柱", {
    x: 0.5, y: 0.35, w: 9, h: 0.55,
    fontSize: 13, color: C.accent, bold: true, align: "left", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.95, w: 9, h: 0.04,
    fill: { color: C.sand }, line: { color: C.sand }
  });

  const pillars = [
    {
      icon: "🏘️",
      title: "地域貢献活動",
      color: C.primary,
      items: ["イベント開催・安満遺跡活用", "子育て支援・子ども食堂", "高齢者の見守り", "こどもの見守り", "職業体験"],
    },
    {
      icon: "📱",
      title: "ポータルサイト",
      color: "0D6E8A",
      items: ["飲食店・病院・保育所", "美容院・塾/習いごと", "物件・宿泊/民泊", "介護施設・就労支援", "放課後デイ・イベント情報"],
    },
    {
      icon: "📣",
      title: "集客施策",
      color: "6B4B8A",
      items: ["SNS・SEO強化", "QRコード店舗設置", "インフルエンサー活用", "広告出稿", "美容院タブレット掲載"],
    },
  ];

  pillars.forEach((p, i) => {
    const x = 0.3 + i * 3.2;
    // カードbg
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.1, w: 3.0, h: 4.2,
      fill: { color: C.light }, line: { color: C.sand },
      shadow: makeShadow(),
    });
    // カラートップバー
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.1, w: 3.0, h: 0.55,
      fill: { color: p.color }, line: { color: p.color }
    });
    // アイコン + タイトル
    s.addText(`${p.icon}  ${p.title}`, {
      x, y: 1.1, w: 3.0, h: 0.55,
      fontSize: 14, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
    });
    // 項目リスト
    s.addText(
      p.items.map((item, idx) => ({
        text: item,
        options: { bullet: true, breakLine: idx < p.items.length - 1, fontSize: 13 }
      })),
      {
        x: x + 0.15, y: 1.72, w: 2.7, h: 3.4,
        color: C.textDark, align: "left", valign: "top",
        paraSpaceAfter: 4,
      }
    );
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 4: マネタイズ戦略（フェーズ別収益）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("マネタイズ戦略", {
    x: 0.5, y: 0.35, w: 9, h: 0.55,
    fontSize: 13, color: C.accent, bold: true, align: "left", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.95, w: 9, h: 0.04,
    fill: { color: C.sand }, line: { color: C.sand }
  });

  // フェーズ収益バーチャート（native chart）
  const chartData = [{
    name: "月次収益目安（万円）",
    labels: ["Phase 1\n0〜3ヶ月", "Phase 2\n3〜6ヶ月", "Phase 3\n6〜12ヶ月", "Phase 4\n12ヶ月〜"],
    values: [0, 10, 35, 50],
  }];

  s.addChart(pres.charts.BAR, chartData, {
    x: 0.4, y: 1.0, w: 5.6, h: 4.2,
    barDir: "col",
    chartColors: [C.textGray, "52B788", C.primary, C.darkBg],
    chartArea: { fill: { color: C.white }, roundedCorners: false },
    catAxisLabelColor: C.textMid,
    valAxisLabelColor: C.textGray,
    valGridLine: { color: "E2EBE5", size: 0.5 },
    catGridLine: { style: "none" },
    showValue: true,
    dataLabelColor: C.textDark,
    showLegend: false,
    valAxisMaxVal: 60,
  });

  // 右側: フェーズ説明カード
  const phases = [
    { ph: "Phase 1", period: "0〜3ヶ月", rev: "¥0",       label: "無料期間・スポンサー探し",    color: C.textGray },
    { ph: "Phase 2", period: "3〜6ヶ月", rev: "¥5〜15万", label: "求人広告・一部有料掲載",       color: "52B788" },
    { ph: "Phase 3", period: "6〜12ヶ月",rev: "¥20〜50万",label: "全有料化・広報代行",           color: C.primary },
    { ph: "Phase 4", period: "12ヶ月〜", rev: "¥50万〜",  label: "イベント主催・不動産連携",     color: C.darkBg },
  ];

  phases.forEach((p, i) => {
    const y = 1.05 + i * 1.04;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.3, y, w: 3.4, h: 0.88,
      fill: { color: C.light }, line: { color: C.sand },
      shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.3, y, w: 0.12, h: 0.88,
      fill: { color: p.color }, line: { color: p.color }
    });
    s.addText([
      { text: `${p.ph}  `, options: { bold: true, fontSize: 12, color: p.color } },
      { text: p.period, options: { fontSize: 10, color: C.textGray, breakLine: true } },
      { text: p.rev, options: { bold: true, fontSize: 16, color: C.textDark, breakLine: true } },
      { text: p.label, options: { fontSize: 10, color: C.textGray } },
    ], {
      x: 6.55, y: y + 0.05, w: 3.1, h: 0.78,
      align: "left", valign: "top",
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 5: 主な収益源
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.light };

  s.addText("主な収益源", {
    x: 0.5, y: 0.35, w: 9, h: 0.55,
    fontSize: 13, color: C.accent, bold: true, align: "left", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.95, w: 9, h: 0.04,
    fill: { color: C.sand }, line: { color: C.sand }
  });

  const sources = [
    { num: "01", title: "店舗・施設の有料掲載",  price: "月額 ¥3,000〜10,000/店舗", desc: "飲食店・美容院・病院・ペットサロン・塾 ／ 最初6ヶ月は無料→有料化" },
    { num: "02", title: "求人広告・転職フェア",   price: "¥10,000〜30,000/掲載",     desc: "地元企業・介護施設・就労支援・放課後デイ ／ フェアスポンサー収入" },
    { num: "03", title: "広告・スポンサードPR",   price: "記事 ¥30,000〜",           desc: "サイト内バナー枠（月額）／ ウェブマガジンPR記事" },
    { num: "04", title: "広報代行サービス",        price: "月額 ¥30,000〜50,000",    desc: "SNS運用代行 ／ ウェブマガジン記事制作・地元企業PR" },
    { num: "05", title: "物件情報・不動産連携",    price: "成果報酬型",               desc: "高槻市内物件まとめページ ／ 不動産会社と連携" },
    { num: "06", title: "宿泊・民泊手数料",        price: "予約金額の5〜10%",        desc: "高槻の宿泊施設・民泊と連携 ／ 予約時に手数料" },
    { num: "07", title: "イベント主催",            price: "年数回・スポンサー収入",   desc: "安満遺跡など高槻ならでは ／ 地元企業スポンサード" },
  ];

  // 2カラムグリッド（4+3）
  const positions = [
    [0.4, 1.1], [5.15, 1.1],
    [0.4, 2.2], [5.15, 2.2],
    [0.4, 3.3], [5.15, 3.3],
    [0.4, 4.4],
  ];

  sources.forEach((src, i) => {
    const [x, y] = positions[i];
    const w = 4.55;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h: 0.9,
      fill: { color: C.white }, line: { color: C.sand },
      shadow: makeShadow(),
    });
    // 番号バッジ
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.1, y: y + 0.2, w: 0.45, h: 0.45,
      fill: { color: C.primary }, line: { color: C.primary }
    });
    s.addText(src.num, {
      x: x + 0.1, y: y + 0.2, w: 0.45, h: 0.45,
      fontSize: 10, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
    });
    // タイトル + 価格
    s.addText([
      { text: src.title + "  ", options: { bold: true, fontSize: 13, color: C.textDark } },
      { text: src.price, options: { fontSize: 11, color: C.accent, bold: true } },
    ], {
      x: x + 0.65, y: y + 0.05, w: w - 0.75, h: 0.38,
      align: "left", valign: "middle",
    });
    s.addText(src.desc, {
      x: x + 0.65, y: y + 0.44, w: w - 0.75, h: 0.38,
      fontSize: 10, color: C.textGray, align: "left", valign: "top",
    });
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slides 6-9: Phase 1〜4 ロードマップ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const phaseData = [
  {
    phase: "Phase 1",
    title: "基盤構築",
    period: "0〜3ヶ月",
    goal: "サイトのMVPをつくり、掲載店舗を集める",
    kpi: "掲載施設数 50件以上  ／  月間PV 1,000以上",
    color: "52A37A",
    tasks: [
      "参考ポータルサイト（takatsuki.mypl.net）の研究・差別化整理",
      "サイト設計・ワイヤーフレーム作成",
      "SNSアカウント開設（Instagram / X / LINE）",
      "初期掲載コンテンツ収集（飲食店・病院・保育所 各10件〜）",
      "無料掲載の店舗・施設へのアポイント開始",
      "セキュリティ・個人情報ポリシーの整備",
      "MVPサイトのローンチ（無料掲載のみ）",
    ],
  },
  {
    phase: "Phase 2",
    title: "集客 & 初期マネタイズ",
    period: "3〜6ヶ月",
    goal: "ユーザーを集めながら、最初の収益をつくる",
    kpi: "月間PV 5,000以上  ／  有料掲載 20件以上  ／  月次収益 ¥5万以上",
    color: "0D7A5F",
    tasks: [
      "SEO対策（高槻 × 各カテゴリのキーワード強化）",
      "地元インフルエンサーとの連携企画",
      "店舗へのQRコード設置（美容院・飲食店タブレット活用）",
      "求人広告枠の販売開始",
      "ウェブマガジン・コラムコーナーの立ち上げ",
      "イベント情報の充実（安満遺跡イベント等の掲載）",
      "子ども食堂・職業体験など地域貢献イベント 第1回開催",
    ],
  },
  {
    phase: "Phase 3",
    title: "本格マネタイズ",
    period: "6〜12ヶ月",
    goal: "複数の収益柱を確立し、安定運営へ",
    kpi: "月間PV 20,000以上  ／  有料掲載 100件以上  ／  月次収益 ¥20万以上",
    color: C.primary,
    tasks: [
      "全掲載カテゴリの有料プラン展開",
      "地元企業向け広報代行サービスの開始",
      "転職フェアの初回開催（地元企業・就労支援事業所を集客）",
      "高槻市内物件まとめページと不動産会社の連携",
      "宿泊・民泊情報の予約連携機能",
      "高齢者見守り・こどもの見守りサービスとの連携掲載",
      "市や地域団体への働きかけ（行政連携の検討）",
    ],
  },
  {
    phase: "Phase 4",
    title: "拡大・ブランド化",
    period: "12ヶ月〜",
    goal: "高槻の「地域インフラ」としてのポジションを確立",
    kpi: "月間PV 50,000以上  ／  月次収益 ¥50万以上",
    color: C.darkBg,
    tasks: [
      "安満遺跡・高槻ならではの大型イベント主催",
      "子育て世代・転入者向けの定住促進コンテンツ強化",
      "「高槻に住む」をテーマにした移住促進コンテンツ",
      "市外への展開検討（摂津・茨木・島本など近隣都市）",
      "コミュニティ機能（掲示板・グループ）の追加",
    ],
  },
];

phaseData.forEach((pd, idx) => {
  const s = pres.addSlide();
  s.background = { color: C.white };

  // 左ヘッダーカラムバー
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 3.5, h: 5.625,
    fill: { color: pd.color }, line: { color: pd.color }
  });

  // フェーズ番号
  s.addText(pd.phase, {
    x: 0.1, y: 0.3, w: 3.3, h: 0.6,
    fontSize: 13, color: "FFFFFF", bold: true, align: "left", margin: 0,
    charSpacing: 3,
  });

  // タイトル
  s.addText(pd.title, {
    x: 0.1, y: 0.9, w: 3.3, h: 1.0,
    fontSize: 30, color: C.white, bold: true, align: "left", valign: "top",
    lineSpacingMultiple: 1.1,
  });

  // 期間
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.1, y: 2.0, w: 3.0, h: 0.38,
    fill: { color: "FFFFFF", transparency: 80 }, line: { color: "FFFFFF", transparency: 60 }
  });
  s.addText(pd.period, {
    x: 0.1, y: 2.0, w: 3.0, h: 0.38,
    fontSize: 14, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
  });

  // 目標
  s.addText("目標", {
    x: 0.15, y: 2.55, w: 1.0, h: 0.3,
    fontSize: 10, color: C.white, bold: true, align: "left", margin: 0,
  });
  s.addText(pd.goal, {
    x: 0.15, y: 2.85, w: 3.2, h: 1.2,
    fontSize: 13, color: C.white, align: "left", valign: "top",
    lineSpacingMultiple: 1.4,
  });

  // KPIブロック
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.1, y: 4.2, w: 3.3, h: 1.1,
    fill: { color: "FFFFFF", transparency: 85 }, line: { color: "FFFFFF", transparency: 50 }
  });
  s.addText("KPI", {
    x: 0.2, y: 4.25, w: 3.1, h: 0.28,
    fontSize: 10, color: C.white, bold: true, align: "left", margin: 0,
  });
  s.addText(pd.kpi, {
    x: 0.2, y: 4.52, w: 3.1, h: 0.72,
    fontSize: 11, color: C.white, align: "left", valign: "top",
    lineSpacingMultiple: 1.4,
  });

  // 右側: タスクリスト
  s.addText("アクションリスト", {
    x: 3.8, y: 0.35, w: 5.9, h: 0.4,
    fontSize: 12, color: C.textGray, bold: true, align: "left", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.8, y: 0.8, w: 5.9, h: 0.03,
    fill: { color: C.sand }, line: { color: C.sand }
  });

  pd.tasks.forEach((task, ti) => {
    const ty = 0.95 + ti * 0.66;
    // チェックボックス丸
    s.addShape(pres.shapes.OVAL, {
      x: 3.82, y: ty + 0.1, w: 0.3, h: 0.3,
      fill: { color: C.light }, line: { color: pd.color, width: 1.5 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 4.22, y: ty + 0.22, w: 5.4, h: 0.02,
      fill: { color: C.sand }, line: { color: C.sand }
    });
    s.addText(task, {
      x: 4.25, y: ty, w: 5.4, h: 0.55,
      fontSize: 13, color: C.textDark, align: "left", valign: "middle",
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Slide 10: 今すぐ始めること
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  // 左アクセント
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: C.accent }, line: { color: C.accent }
  });

  s.addText("今すぐ始めること", {
    x: 0.4, y: 0.35, w: 9, h: 0.55,
    fontSize: 13, color: C.accent, bold: true, align: "left", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: 0.95, w: 9.3, h: 0.03,
    fill: { color: C.primary }, line: { color: C.primary }
  });

  const actions = [
    { stars: "★★★", action: "参考サイト（takatsuki.mypl.net）の徹底分析と差別化戦略の決定", priority: "最優先" },
    { stars: "★★★", action: "SNSアカウント開設（まずInstagramから）",                         priority: "最優先" },
    { stars: "★★☆", action: "知り合いの飲食店・美容院に無料掲載の声かけ",                     priority: "高" },
    { stars: "★★☆", action: "サイトの技術スタック・制作方法の検討（WordPress / 外注 / 自作）",priority: "高" },
    { stars: "★☆☆", action: "地元インフルエンサーのリサーチ",                                 priority: "中" },
  ];

  const priorityColors = { "最優先": C.accent, "高": "52B788", "中": C.textGray };

  actions.forEach((a, i) => {
    const y = 1.1 + i * 0.87;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y, w: 9.2, h: 0.76,
      fill: { color: "FFFFFF", transparency: 92 }, line: { color: C.primary }
    });

    // 優先度バッジ
    const badgeColor = priorityColors[a.priority];
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y, w: 1.1, h: 0.76,
      fill: { color: badgeColor }, line: { color: badgeColor }
    });
    s.addText([
      { text: a.stars + "\n", options: { fontSize: 11, breakLine: true } },
      { text: a.priority, options: { fontSize: 10, bold: true } },
    ], {
      x: 0.4, y, w: 1.1, h: 0.76,
      color: C.darkBg, align: "center", valign: "middle",
    });

    s.addText(a.action, {
      x: 1.65, y, w: 7.9, h: 0.76,
      fontSize: 15, color: C.white, align: "left", valign: "middle",
    });
  });

  // フッター
  s.addText("高槻地域貢献プロジェクト ／ 2026", {
    x: 0.4, y: 5.2, w: 9.3, h: 0.3,
    fontSize: 10, color: C.textGray, align: "right",
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 出力
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pres.writeFile({ fileName: "/Users/ishida/Desktop/claude code/高槻_地域貢献プロジェクト_ロードマップ.pptx" })
  .then(() => console.log("✅ PPTX 作成完了"))
  .catch(e => { console.error("❌ エラー:", e); process.exit(1); });

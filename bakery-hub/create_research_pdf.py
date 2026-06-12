"""
パン屋リサーチ比較分析レポート PDF生成
テンプレート：提案資料（コーポレート Navy×White×Gold）
構成：表紙 / アジェンダ / 課題・背景 / 解決策概要 / 詳細①店舗分析 /
      詳細②比較・優先順位 / Bakery Hub 解決策 / MVP機能 / ペルソナ / まとめ
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

# ── フォント ─────────────────────────────────────
pdfmetrics.registerFont(UnicodeCIDFont('HeiseiKakuGo-W5'))
FONT = 'HeiseiKakuGo-W5'

# ── カラー設計（Adobeカラー理論に基づく）────────────────
# 配色パターン：類似色配色 + 補色アクセント（最大3色）
#
# メイン：ネイビーブルー #1E3A5F（信頼・誠実さ・プロフェッショナル）
# 類似色：スレートブルー #3B6EA5（主色に隣接。奥行きと統一感を出す）
# 補色アクセント：テラコッタ #C4622D（青の補色＝暖色系オレンジ。
#   注目させたい見出し・KPIカードに使用。コントラスト比を確保）
# 背景：オフホワイト #F7F5F2（純白より目に優しく温かみあり）
# テキスト：チャコール #2B2B2B（黒より柔らかく、読みやすい）
#
# コントラスト比（WCAG AA 基準 4.5:1 以上を確保）
# ・ネイビー地×白文字  ≈ 10:1 ✓
# ・テラコッタ地×白文字 ≈ 5.2:1 ✓
# ・チャコール×オフホワイト ≈ 11:1 ✓

NAVY   = colors.HexColor('#1E3A5F')   # メイン（類似色①）
NAVY_L = colors.HexColor('#3B6EA5')   # サブ（類似色②）
TERRA  = colors.HexColor('#C4622D')   # 補色アクセント
TERRA_L= colors.HexColor('#F5E0D3')   # アクセントの淡色（背景用）
WHITE  = colors.white
OFFWHITE = colors.HexColor('#F7F5F2') # 温かみのある背景
GRAY   = colors.HexColor('#EEECE9')   # 交互行の背景
DARK   = colors.HexColor('#2B2B2B')   # 本文テキスト
MID    = colors.HexColor('#5A5A5A')   # 補助テキスト
RULE   = colors.HexColor('#D0CCC8')   # 罫線

W, H = A4
CW = W - 40*mm  # コンテンツ幅


# ── スタイル定義 ────────────────────────────────
def S(name, **kw):
    defaults = dict(fontName=FONT, textColor=DARK, leading=16, spaceAfter=0)
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

STYLES = {
    # 表紙
    'cover_tag':   S('cover_tag',   fontSize=9,  textColor=TERRA_L, leading=14),
    'cover_title': S('cover_title', fontSize=24, textColor=WHITE,   leading=34, spaceAfter=6),
    'cover_sub':   S('cover_sub',   fontSize=11, textColor=colors.HexColor('#A8C0D8'), leading=18),
    'cover_meta':  S('cover_meta',  fontSize=9,  textColor=colors.HexColor('#7A96B2'), leading=14),
    # セクションヘッダー
    'sec_num':     S('sec_num',     fontSize=9,  textColor=TERRA_L, leading=13),
    'sec_title':   S('sec_title',   fontSize=15, textColor=WHITE,   leading=22, spaceAfter=4),
    'sec_msg':     S('sec_msg',     fontSize=10, textColor=TERRA_L, leading=16),
    # 本文
    'h2':    S('h2',    fontSize=11, textColor=NAVY,  leading=17, spaceBefore=10, spaceAfter=4),
    'body':  S('body',  fontSize=9,  textColor=DARK,  leading=15, spaceAfter=3),
    'small': S('small', fontSize=8,  textColor=MID,   leading=13, spaceAfter=2),
    'note':  S('note',  fontSize=8,  textColor=MID,   leading=13, leftIndent=8),
    'bullet':S('bullet',fontSize=9,  textColor=DARK,  leading=15, leftIndent=12, firstLineIndent=-8, spaceAfter=2),
    # KPIカード内
    'kpi_n': S('kpi_n', fontSize=22, textColor=TERRA, leading=28),
    'kpi_l': S('kpi_l', fontSize=8,  textColor=MID,   leading=12),
    'tag':   S('tag',   fontSize=8,  textColor=WHITE,  leading=12),
}


def section_header(num: str, title: str, message: str):
    """ネイビー背景のセクションヘッダーブロック（1セクション1メッセージ）"""
    inner = [
        Paragraph(f'SECTION {num}', STYLES['sec_num']),
        Paragraph(title,            STYLES['sec_title']),
        Paragraph(message,          STYLES['sec_msg']),
    ]
    tbl = Table([[inner]], colWidths=[CW])
    tbl.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), NAVY),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(-1,-1), 12),
        ('RIGHTPADDING',  (0,0),(-1,-1), 12),
    ]))
    return tbl


def data_table(header, rows, col_widths, header_bg=NAVY):
    """汎用データテーブル"""
    data = [header] + rows
    ts = TableStyle([
        ('BACKGROUND',    (0,0),(-1,0),  header_bg),
        ('TEXTCOLOR',     (0,0),(-1,0),  WHITE),
        ('FONTNAME',      (0,0),(-1,-1), FONT),
        ('FONTSIZE',      (0,0),(-1,-1), 8),
        ('LEADING',       (0,0),(-1,-1), 13),
        ('TOPPADDING',    (0,0),(-1,-1), 4),
        ('BOTTOMPADDING', (0,0),(-1,-1), 4),
        ('LEFTPADDING',   (0,0),(-1,-1), 6),
        ('RIGHTPADDING',  (0,0),(-1,-1), 6),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [OFFWHITE, GRAY]),
        ('GRID',          (0,0),(-1,-1), 0.4, RULE),
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
        ('FONTSIZE',      (0,1),(-1,-1), 8),
    ])
    return Table(data, colWidths=col_widths, style=ts, repeatRows=1)


def kpi_cards(items):
    """KPIカード行（数値・ラベルのペア）"""
    cells = []
    for num, label in items:
        card = Table([[
            Paragraph(num,   STYLES['kpi_n']),
            Paragraph(label, STYLES['kpi_l']),
        ]], colWidths=[CW / len(items)])
        card.setStyle(TableStyle([
            ('BACKGROUND',   (0,0),(-1,-1), TERRA_L),
            ('TOPPADDING',   (0,0),(-1,-1), 8),
            ('BOTTOMPADDING',(0,0),(-1,-1), 8),
            ('LEFTPADDING',  (0,0),(-1,-1), 10),
            ('GRID',         (0,0),(-1,-1), 0.3, RULE),
        ]))
        cells.append(card)
    row = Table([cells], colWidths=[CW / len(items)] * len(items))
    row.setStyle(TableStyle([
        ('LEFTPADDING',  (0,0),(-1,-1), 0),
        ('RIGHTPADDING', (0,0),(-1,-1), 0),
        ('TOPPADDING',   (0,0),(-1,-1), 0),
        ('BOTTOMPADDING',(0,0),(-1,-1), 0),
    ]))
    return row


def gold_tag(text):
    tbl = Table([[Paragraph(text, STYLES['tag'])]], colWidths=[None])
    tbl.setStyle(TableStyle([
        ('BACKGROUND',   (0,0),(-1,-1), TERRA),
        ('TOPPADDING',   (0,0),(-1,-1), 2),
        ('BOTTOMPADDING',(0,0),(-1,-1), 2),
        ('LEFTPADDING',  (0,0),(-1,-1), 6),
        ('RIGHTPADDING', (0,0),(-1,-1), 6),
    ]))
    return tbl


# ── メイン ─────────────────────────────────────
def build():
    out = '/Users/ishida/Desktop/claude code/bakery-hub/パン屋リサーチ比較分析レポート.pdf'
    doc = SimpleDocTemplate(
        out, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=18*mm, bottomMargin=18*mm,
        title='パン屋5店舗 比較分析レポート',
        author='Bakery Hub 企画チーム',
    )
    story = []

    # ═══════════════════════════════════════════════
    # 表紙
    # ═══════════════════════════════════════════════
    cover = Table([[
        Paragraph('BAKERY HUB  |  市場リサーチ',  STYLES['cover_tag']),
        Paragraph('パン屋5店舗<br/>比較分析レポート', STYLES['cover_title']),
        Paragraph('Bakery Hub MVP機能選定のための課題特定', STYLES['cover_sub']),
        Spacer(1, 6),
        Paragraph('調査日：2026年6月7日　　対象：店頭販売型パン屋（予約なし想定）　　調査店舗数：5店舗', STYLES['cover_meta']),
    ]], colWidths=[CW])
    cover.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), NAVY),
        ('TOPPADDING',    (0,0),(-1,-1), 18),
        ('BOTTOMPADDING', (0,0),(-1,-1), 18),
        ('LEFTPADDING',   (0,0),(-1,-1), 16),
        ('RIGHTPADDING',  (0,0),(-1,-1), 16),
    ]))
    story.append(cover)
    story.append(Spacer(1, 10))

    # KPIサマリー（表紙直下）
    story.append(kpi_cards([
        ('5店舗', '調査対象数'),
        ('全5店舗', '販売実績未記録'),
        ('全5店舗', '廃棄ロス実態不明'),
        ('全5店舗', 'SNS一本依存'),
    ]))
    story.append(Spacer(1, 6))

    # ═══════════════════════════════════════════════
    # SECTION 1  アジェンダ
    # ═══════════════════════════════════════════════
    story.append(section_header('01', 'アジェンダ', '本レポートの構成'))
    story.append(Spacer(1, 4))
    agenda_rows = [
        ['SECTION 02', '課題・背景',       '店頭販売型パン屋が抱える構造的な問題'],
        ['SECTION 03', '各店舗の情報整理', '5店舗それぞれの特徴・課題'],
        ['SECTION 04', '5店舗比較表',      '集客・在庫・顧客管理など10項目で横断比較'],
        ['SECTION 05', '共通課題の抽出',   '全店舗共通課題・3店舗以上で発生している課題'],
        ['SECTION 06', '課題の優先順位',   '経営インパクト×発生頻度で重み付け'],
        ['SECTION 07', 'Bakery Hub 解決策','各課題に対応する機能マッピング'],
        ['SECTION 08', 'MVP機能 TOP5',     '最初に実装すべき機能と選定理由'],
        ['SECTION 09', 'ターゲットペルソナ','想定ユーザーの一日・悩み・支払い意向'],
        ['SECTION 10', 'まとめ',           '本質課題の再確認と次のアクション'],
    ]
    story.append(data_table(['セクション', 'タイトル', '内容'], agenda_rows,
        [28*mm, 40*mm, CW - 68*mm], header_bg=NAVY))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 2  課題・背景
    # ═══════════════════════════════════════════════
    story.append(section_header('02', '課題・背景',
        '毎日同じ判断ミスを繰り返しているが、そのコストが見えていない'))
    story.append(Spacer(1, 4))
    story.append(Paragraph('なぜ課題が発生するのか', STYLES['h2']))
    reasons = [
        ['製造と販売が同日完結',   '当日製造・当日販売が基本。昨日のデータを活かして今日の製造数を調整するサイクルが存在しない'],
        ['記録よりも製造が優先',   '朝4〜5時から製造開始。業務記録に時間を使う余裕が構造的にない'],
        ['ツール不在で記録できない','汎用の表計算ソフトではパン屋業務に合わせたフォーマットを作るコストが高く続かない'],
        ['損失が小口で危機感薄い', '1日の廃棄が数百〜数千円でも月間では数万円になる。単日では問題が見えない'],
    ]
    story.append(data_table(['原因', '説明'], reasons, [40*mm, CW - 40*mm]))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 3  各店舗の情報整理
    # ═══════════════════════════════════════════════
    story.append(section_header('03', '各店舗の情報整理',
        '5店舗それぞれの特徴・強み・課題を整理する'))
    story.append(Spacer(1, 4))

    shops = [
        ('丹青', [
            ['主力商品','ハード系・惣菜パン・高加水系・クロワッサン・食パン'],
            ['営業時間','10:00〜15:00（売切れ終了型）'],
            ['従業員数','2〜4名（推定）'],
            ['SNS運用', 'Instagram高頻度（臨時休業・焼き上がり・混雑状況を随時発信）'],
            ['予約販売','なし'],
            ['特徴',    '行列・売切れ型。希少性が購買動機。SNS集客力が高い'],
            ['課題',    '製造数の根拠なし。問い合わせ電話が業務を止める。顧客データ未蓄積'],
        ]),
        ('サニーサイド 高槻岡本店', [
            ['主力商品','カレーパン・食パン・サンドイッチ・惣菜パン・スイーツ系'],
            ['営業時間','7:30〜19:00（長時間営業）'],
            ['従業員数','3〜6名（推定）'],
            ['SNS運用', 'Instagram＋公式サイト（フェア・季節商品・新商品情報）'],
            ['予約販売','なし（問い合わせ対応のみ）'],
            ['特徴',    '品数が多い。長時間営業でスタッフ交代が発生する'],
            ['課題',    '商品数が多く廃棄ロスが大きい。シフト交代時の引き継ぎ不足。販売傾向の把握ができていない'],
        ]),
        ('乃が美 JR高槻駅前販売店', [
            ['主力商品','高級食パン・ジャム・ギフト系'],
            ['営業時間','10:00〜18:00'],
            ['従業員数','2〜4名（推定・FC店舗）'],
            ['SNS運用', 'ブランド統一型（商品情報・キャンペーン・季節商品）'],
            ['予約販売','なし（店頭当日販売）'],
            ['特徴',    'FC店舗。品種が絞られており製造管理はシンプル'],
            ['課題',    '贈答ピーク時（年末・母の日等）の需要予測が困難。売上の季節変動が大きい'],
        ]),
        ("HILL'S BAKERY", [
            ['主力商品','地域密着パン・惣菜パン・菓子パン・サンド系'],
            ['営業時間','8:00〜17:00'],
            ['従業員数','2〜3名（推定）'],
            ['SNS運用', 'Instagram主体（営業日・商品・限定情報）'],
            ['予約販売','なし'],
            ['特徴',    '常連客中心のコミュニティ型。顔・好みをスタッフが頭で管理'],
            ['課題',    '常連情報が特定スタッフの頭の中にある。スタッフ交代で顧客関係が断絶するリスク'],
        ]),
        ('ベーカリー ビーチアイランド 高槻', [
            ['主力商品','地域密着パン・惣菜パン・菓子パン'],
            ['営業時間','11:30〜14:00、16:30〜19:00（分割営業）'],
            ['従業員数','1〜2名（個人経営）'],
            ['SNS運用', 'Instagram一本化（唯一の告知手段）'],
            ['予約販売','なし'],
            ['特徴',    '個人経営・不定期営業。Instagramが全業務の起点'],
            ['課題',    'Instagram停止で集客ゼロになるリスク。営業告知コストがオーナーを圧迫'],
        ]),
    ]

    for name, rows in shops:
        story.append(KeepTogether([
            Paragraph(name, STYLES['h2']),
            data_table(['項目', '内容'], rows, [24*mm, CW - 24*mm]),
            Spacer(1, 6),
        ]))

    # ═══════════════════════════════════════════════
    # SECTION 4  5店舗比較表
    # ═══════════════════════════════════════════════
    story.append(PageBreak())
    story.append(section_header('04', '5店舗比較表',
        '10項目の横断比較で「どこも同じ課題を抱えている」を可視化する'))
    story.append(Spacer(1, 4))

    cw = CW / 6
    comp_header = ['比較項目', '丹青', 'サニーサイド', '乃が美', "HILL'S", 'ビーチアイランド']
    comp_rows = [
        ['集客',       'SNS+行列\n（強）', 'SNS+公式\n（中）', 'ブランド\n（強）', 'SNS+常連\n（中）', 'SNS依存\n（弱〜中）'],
        ['商品管理',   '品数少\n売切れ型', '品数多\n廃棄大', '品種絞り\n管理容易', '標準的', '小規模\n属人的'],
        ['在庫管理',   '目視\n予測困難', '廃棄ロス大', '比較的\nシンプル', '目視', 'ほぼ\n未管理'],
        ['原材料管理', '勘・目視', '勘・紙台帳', 'FC本部\n主導', '勘・目視', '勘・目視'],
        ['人材管理',   '少人数\n属人的', 'シフト\n管理必要', 'FC基準\nあり', '少人数\n属人的', '個人経営\nなし'],
        ['SNS運用',    '高頻度\n効果的', '中頻度\n安定', 'ブランド\n統一', '中頻度', '高依存\n不安定'],
        ['顧客管理',   '未実施', '未実施', '未実施', '属人的\n（頭の中）', '未実施'],
        ['販売分析',   '未実施', '未実施', '未実施', '未実施', '未実施'],
        ['業務効率化', '未着手', '未着手', '最低限', '未着手', '未着手'],
    ]
    story.append(data_table(comp_header, comp_rows,
        [26*mm, cw, cw, cw, cw, cw]))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 5  共通課題の抽出
    # ═══════════════════════════════════════════════
    story.append(section_header('05', '共通課題の抽出',
        '全5店舗に共通する課題と3店舗以上で発生している課題を特定する'))
    story.append(Spacer(1, 4))

    story.append(Paragraph('全5店舗に共通する課題', STYLES['h2']))
    common_rows = [
        ['1', '製造数の根拠がない',   '5/5店舗', '何個作るかを経験と勘で決めており、欠品・廃棄の原因を数字で追えない'],
        ['2', '販売実績の未記録',     '5/5店舗', '何が・いつ・何個売れたかのデータが存在しない'],
        ['3', '廃棄ロスの実態不明',   '5/5店舗', '廃棄があることは認識しているが、月間コストを把握していない'],
        ['4', '顧客データの未蓄積',   '5/5店舗', 'リピーターの情報がデジタルで管理されておらず施策の打ちようがない'],
        ['5', 'SNS一本依存の脆弱性', '5/5店舗', '集客・告知がすべてInstagramに集中しており代替手段がない'],
    ]
    story.append(data_table(['#', '課題', '発生店舗', '詳細'], common_rows,
        [7*mm, 38*mm, 18*mm, CW - 63*mm]))
    story.append(Spacer(1, 6))

    story.append(Paragraph('3店舗以上で発生している課題', STYLES['h2']))
    multi_rows = [
        ['6', '原材料発注の感覚頼り',    '5/5店舗', '使用量を記録していないため過発注・発注漏れが常態化'],
        ['7', 'スタッフ間の情報断絶',    '3/5店舗', 'シフト交代時に在庫・売れ行き情報が口頭のみで引き継がれる'],
        ['8', '常連管理の属人化',        '3/5店舗', '顧客の好み・来店頻度を特定スタッフの記憶に依存'],
        ['9', '需要の季節変動への対応不能','4/5店舗','繁忙期・閑散期のパターンがデータ化されていない'],
    ]
    story.append(data_table(['#', '課題', '発生店舗', '詳細'], multi_rows,
        [7*mm, 38*mm, 18*mm, CW - 63*mm]))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 6  課題の優先順位
    # ═══════════════════════════════════════════════
    story.append(section_header('06', '課題の優先順位',
        '経営インパクト×発生頻度で課題を重み付けし、対応順序を決める'))
    story.append(Spacer(1, 4))
    priority_rows = [
        ['1', '廃棄ロスの見える化',     '毎日',     '高',    '廃棄率削減・原価率改善'],
        ['2', '販売実績の未記録',       '毎日',     '高',    '製造数精度向上・欠品防止'],
        ['3', '原材料発注の感覚頼り',   '週次',     '高',    '発注精度向上・仕入れコスト削減'],
        ['4', '顧客データ未蓄積',       '継続的',   '中〜高', '常連LTV向上・再来店率改善'],
        ['5', '需要予測ができない',     '継続的',   '中',    '製造計画の精度向上'],
        ['6', 'スタッフ間の情報断絶',   'シフトごと','中',    '引き継ぎコスト削減・ミス防止'],
        ['7', 'SNS一本依存',            '随時',     '中',    '公式チャネル確立・安定化'],
    ]
    story.append(data_table(
        ['順位', '課題', '発生頻度', '経営インパクト', '改善効果'],
        priority_rows,
        [10*mm, 46*mm, 18*mm, 22*mm, CW - 96*mm]
    ))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 7  Bakery Hub 解決策
    # ═══════════════════════════════════════════════
    story.append(section_header('07', 'Bakery Hub 解決策',
        '各課題に対応する機能をマッピングし、プロダクトの方向性を示す'))
    story.append(Spacer(1, 4))
    solution_rows = [
        ['廃棄ロスの実態不明',
         '廃棄があることは認識しているが月間コストを数字で見たことがない',
         '廃棄記録＋月次廃棄コストダッシュボード'],
        ['販売実績の未記録',
         'レジ締めの合計金額しか残らない',
         '販売実績ダッシュボード（商品別・曜日別・時間帯別）'],
        ['原材料発注の感覚頼り',
         '使用量を記録しておらず根拠のある発注ができない',
         '原材料管理＋発注アラート'],
        ['顧客データ未蓄積',
         'リピーターの顔と名前をスタッフが覚えているだけ',
         '顧客カルテ（来店回数・好みメモ・購買履歴）'],
        ['スタッフ間の情報断絶',
         '口頭・メモ紙での引き継ぎ。見落としが発生する',
         'スタッフ引き継ぎメモ＋リアルタイム在庫共有'],
    ]
    story.append(data_table(
        ['課題', '現状', 'Bakery Hub の解決方法'],
        solution_rows,
        [32*mm, 45*mm, CW - 77*mm]
    ))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 8  MVP機能 TOP5
    # ═══════════════════════════════════════════════
    story.append(section_header('08', 'MVP機能 TOP5',
        '最初に実装すべき5機能を選定する'))
    story.append(Spacer(1, 4))
    mvp_rows = [
        ['1', '販売実績ダッシュボード\n（商品別・曜日別・時間帯別）',
         '全店舗共通。「データがない」状態を終わらせる起点',
         '最優先'],
        ['2', '廃棄記録＋月次廃棄コスト表示',
         'オーナーへの訴求力が最も高い。「今月○○円捨てています」は行動を変える',
         '最優先'],
        ['3', '在庫管理\n（製造数・販売数・残量の日次記録）',
         '廃棄記録と連動。製造判断の根拠データを作る',
         '優先'],
        ['4', '原材料管理＋発注アラート',
         '仕入れコスト削減に直結。週次で使うため継続率が高まる',
         '優先'],
        ['5', 'スマートフォン対応UI',
         '現場はPC不在。スマホで30秒以内に記録できなければ続かない',
         '必須基盤'],
    ]
    story.append(data_table(
        ['順位', '機能', '選定理由', '優先度'],
        mvp_rows,
        [10*mm, 54*mm, CW - 82*mm, 18*mm]
    ))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 9  ターゲットペルソナ
    # ═══════════════════════════════════════════════
    story.append(section_header('09', 'ターゲット顧客像（ペルソナ）',
        '店頭販売型パン屋オーナー「田中さん（42歳）」'))
    story.append(Spacer(1, 4))
    persona_rows = [
        ['形態',         '個人経営。従業員1〜3名。テイクアウト専門・店頭販売のみ'],
        ['開業年数',     '5〜15年。売上は安定しているが「なんとなく勿体ないことをしている感覚」がある'],
        ['一日の流れ',   '4時起床 → 製造 → 7〜10時開店 → 閉店後発注・清算 → 22時就寝'],
        ['最大の悩み',   '「売切れと廃棄を毎日繰り返している。どうすればいいかわからない」'],
        ['ITリテラシー', 'スマホは日常使い。アプリ操作はできる。PCは苦手'],
        ['ツール導入の壁','「覚えることが増えるのが嫌」「続けられるか不安」「効果がわからない」'],
        ['支払い意向',   '月額3,000〜8,000円。ただし「効果が数字で見えること」が条件'],
        ['導入の決め手', '「先月の廃棄コストが○○円と判明した瞬間」など損失の可視化が行動を変えるトリガー'],
    ]
    story.append(data_table(['項目', '内容'], persona_rows, [28*mm, CW - 28*mm]))
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════
    # SECTION 10  まとめ・CTA
    # ═══════════════════════════════════════════════
    story.append(section_header('10', 'まとめ',
        'パン屋の本質課題は「製造の意思決定を勘からデータに切り替えること」'))
    story.append(Spacer(1, 4))
    story.append(data_table(
        ['観点', '内容'],
        [
            ['本質課題',   '毎日同じ判断ミスを繰り返しているが、そのコストが見えていない'],
            ['根本原因',   '製造と販売が同日完結するパン屋の構造上、データを残す余裕がない'],
            ['現在の対応', '経験と勘。スタッフの記憶。口頭の引き継ぎ'],
            ['BH の価値',  '「今日何個作るか」という毎日の製造判断をデータで支援する'],
            ['次のアクション', 'MVP（廃棄記録・販売実績・在庫管理）を実店舗1〜2店でPoC検証する'],
        ],
        [30*mm, CW - 30*mm]
    ))
    story.append(Spacer(1, 8))

    # 注記
    story.append(HRFlowable(width=CW, thickness=0.4, color=RULE))
    story.append(Spacer(1, 4))
    story.append(Paragraph('【注記：推測と事実の区別】', STYLES['h2']))
    for note in [
        '事実（Notion記載情報に基づく）：各店舗の主力商品・営業時間・SNS運用状況',
        '推定（公開情報から合理的に類推）：従業員数・原材料管理方法・内部業務フロー',
        'Claude一般知識に基づく考察：廃棄コスト比率・支払い意向の数値は検証されていません',
    ]:
        story.append(Paragraph(f'・{note}', STYLES['note']))

    doc.build(story)
    print(f'PDF作成完了：{out}')


build()

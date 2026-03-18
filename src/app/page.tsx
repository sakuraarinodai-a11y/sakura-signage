'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════
//  コンテンツライブラリ
// ═══════════════════════════════════════════════════════════════

const HEALTH_FACTS = [
  { stat: '72.5%', label: '日本人の首筋・肩こり有訴率', sub: '30〜40代の働き盛りでは75.3%\n実は国民病です' },
  { stat: '1,000万人', label: '腰痛に悩む日本人の数（最新）', sub: '腰痛は日本人の愁訴第1位\n多くは整骨院で改善できます' },
  { stat: '27kg', label: 'スマホを見るときの首への負担', sub: '下を向くだけでこれだけの重さが\n首にかかっています' },
  { stat: '女性1位', label: '肩こりが女性の愁訴ランキング', sub: '1,000人あたり約120人が悩む\nとても身近な症状です' },
  { stat: '6倍', label: '猫背のときの椎間板への負担', sub: '正しい姿勢のときと比べて\n背骨への負担が6倍になります' },
  { stat: '80%', label: '腰痛は姿勢・筋肉が原因', sub: '病気ではないからこそ\n整骨院のアプローチが効果的です' },
  { stat: '26個', label: '背骨を構成する椎骨の数', sub: '一つひとつを整えることが\n全身の健康につながります' },
  { stat: '1/3', label: '人生の中で睡眠に費やす時間', sub: '正しい睡眠姿勢が体の回復を\n大きく左右します' },
];

const HEALTH_TIPS = [
  { icon: '📱', title: 'スマホは目線の高さで', body: '下を向く姿勢が首・肩への\n負担を大幅に増やします\n画面を持ち上げる習慣を' },
  { icon: '🪑', title: '坐骨で深く座る', body: '椅子に浅く腰かけると腰に\n大きな負担がかかります\n深く座って背もたれを使いましょう' },
  { icon: '💤', title: '仰向け睡眠が理想', body: '横向き寝は体の歪みを\nじわじわ引き起こします\n枕の高さも見直してみて' },
  { icon: '🚶', title: '踵から着地する歩き方', body: '正しい歩行で腰への衝撃を\n効果的に吸収できます\n歩き方一つで腰痛予防に' },
  { icon: '💧', title: '1日1.5Lの水を飲む', body: '椎間板の80%は水分です\n水分不足は腰痛・肩こりを\n悪化させます' },
  { icon: '⏰', title: '1時間に1回立ち上がる', body: '座り続けると腰への負担が\n立位の2倍になります\nこまめな休憩が体を守ります' },
  { icon: '🦶', title: '足の指をもんで老化予防', body: '足指をグルグル回すだけで\n足腰の血流が改善されます\nテレビを見ながらでもOK' },
  { icon: '🌙', title: '就寝前のカフェインに注意', body: '就寝3時間前以降のカフェインは\n睡眠の質を大幅に下げます\n体の回復に影響が出ます' },
  { icon: '🌡️', title: '冷えは万病のもと', body: '体が冷えると筋肉が固まり\n肩こり・腰痛が悪化します\n特にエアコン環境に注意' },
  { icon: '🧘', title: '深呼吸でリセット', body: '肩に力が入っていませんか？\n深呼吸するだけで\n首・肩の緊張が緩みます' },
];

const TESTIMONIALS = [
  { text: '毎月通っています。肩の重さが全然違う。\n先生の施術は丁寧で毎回スッキリ帰れます', person: 'N様・50代・会社員', tag: '肩こり' },
  { text: '子育て中の腰痛がひどくて…\nサブスクで気軽に通えるので本当に助かっています', person: 'K様・30代・主婦', tag: '腰痛' },
  { text: 'むち打ちで通い始めました。\n先生が丁寧に説明してくれて安心できました', person: 'T様・40代', tag: 'むち打ち' },
  { text: 'テレワークになってから肩と首が辛くて。\n定期的に通うようになってから全然違います', person: 'M様・30代・IT系', tag: '肩こり・首こり' },
  { text: '保険が使えるので続けやすい。\n近所にこんな良い整骨院があって良かった', person: 'Y様・60代', tag: '保険診療' },
];

const STRETCHES = [
  {
    name: '首こり解消 30秒ストレッチ',
    icon: '🔄',
    steps: ['首をゆっくり右に倒す', '10秒キープして反対側へ', '1日3回でスッキリ'],
    accent: '#a29bfe',
  },
  {
    name: '肩こり撃退 肩回しストレッチ',
    icon: '🌀',
    steps: ['両肩をゆっくり後ろに大きく回す', '前回しと後ろ回しを各10回', 'デスクワーク中でもできます'],
    accent: '#fd79a8',
  },
  {
    name: '腰痛予防 体幹ストレッチ',
    icon: '⬆️',
    steps: ['立ったまま両手を組んで上に伸ばす', '深呼吸しながら10秒キープ', '繰り返し3セットで腰が楽に'],
    accent: '#fdcb6e',
  },
];

const CAMPAIGNS = [
  { icon: '🎁', title: '初回お試し', body: '初めての方は\nご相談・検査無料', detail: '気になることは何でもお聞きください', accent: '#00b894' },
  { icon: '♾️', title: 'サブスク月額7,800円', body: '60分施術（8,000円相当）が毎月1回\nさらに施術ごとに10%OFF', detail: '定額で体のメンテナンスを習慣に', accent: '#6c5ce7' },
  { icon: '💳', title: '保険診療あります', body: '健康保険適用で\n窓口負担を抑えて通える', detail: '保険証をお持ちください', accent: '#0984e3' },
];

const SPECIAL_SERVICES = [
  {
    id: 'oxygen',
    icon: '🫁',
    label: '酸素カプセル',
    stat: '1時間',
    statSub: '＝ 睡眠約3時間分の疲労回復',
    headline: '疲れが取れない\nそのお悩みに',
    bullets: [
      '🔋 慢性疲労・倦怠感をリセット',
      '✨ 肌のハリ・血色が改善',
      '🏃 スポーツ後の素早い回復',
      '😴 睡眠の質をアップ',
    ],
    gradient: 'linear-gradient(135deg, #001428, #002850)',
    accent: '#74b9ff',
  },
  {
    id: 'ems',
    icon: '⚡',
    label: '楽トレ EMS（ビーセス）',
    stat: '9,000回',
    statSub: '30分間の筋収縮数',
    headline: '寝たまま動かずに\n筋肉を鍛える',
    bullets: [
      '💪 インナーマッスルを深層から刺激',
      '🦴 腰痛・姿勢の根本改善',
      '🔥 体幹強化・体型引き締め',
      '📏 皮下15cm以上まで届く',
    ],
    gradient: 'linear-gradient(135deg, #001400, #002a00)',
    accent: '#55efc4',
  },
];

// ── 追加サービス（ランダム3枚ローテーション）──────────────────
const EXTRA_SERVICES: Slide[] = [
  // ── 産後骨盤矯正（hook）
  {
    id: 'postnatal-hook',
    gradient: 'radial-gradient(ellipse at 30% 50%, #200015 0%, #0d000a 70%)',
    accent: '#fd79a8',
    type: 'hook',
    data: {
      eyebrow: '🤱 産後のママへ',
      headline: '産後6ヶ月が\n骨盤を取り戻す\nゴールデンタイム',
      sub: 'リラキシンが分泌されている今だけ\n骨盤は正しい位置に戻せます',
    },
  },
  // ── 産後骨盤矯正（service）
  {
    id: 'postnatal-service',
    gradient: 'linear-gradient(135deg, #200015, #3d0030)',
    accent: '#fd79a8',
    type: 'service',
    data: {
      id: 'postnatal',
      icon: '🤱',
      label: '産後骨盤矯正',
      stat: '6ヶ月',
      statSub: '産後のゴールデンタイム\n（リラキシン分泌期間）',
      headline: 'ママの体を\n取り戻す',
      bullets: [
        '🦴 開いた骨盤をしっかり閉じる',
        '💧 尿漏れ・恥骨痛・股関節痛を改善',
        '👗 産後太りの体型・スタイル回復',
        '💆 腰痛・肩こり・頭痛も解消',
      ],
      gradient: 'linear-gradient(135deg, #200015, #3d0030)',
      accent: '#fd79a8',
    },
  },
  // ── ケトジェニックダイエット（hook）
  {
    id: 'keto-hook',
    gradient: 'radial-gradient(ellipse at 70% 50%, #1a0e00 0%, #0d0700 70%)',
    accent: '#fdcb6e',
    type: 'hook',
    data: {
      eyebrow: '🔥 脂肪が落ちない方へ',
      headline: 'ケトジェニックで\n体質ごと\n変える',
      sub: '糖をエネルギー源にする体から\n脂肪を燃やす体へ。施術と組み合わせて効果倍増',
    },
  },
  // ── ケトジェニックダイエット（service）
  {
    id: 'keto-service',
    gradient: 'linear-gradient(135deg, #1a1000, #2d1a00)',
    accent: '#fdcb6e',
    type: 'service',
    data: {
      id: 'keto',
      icon: '🔥',
      label: 'ケトジェニックダイエット推奨',
      stat: '-7.2kg',
      statSub: '6ヶ月継続の平均結果',
      headline: '脂肪を燃やす体へ\n食事から体質改善',
      bullets: [
        '🔥 糖ではなく体脂肪を優先燃焼',
        '💪 筋肉量を維持したまま減量',
        '🩸 血糖値・食欲が安定して続けやすい',
        '✨ 骨盤矯正・EMS施術と組み合わせ最大化',
      ],
      gradient: 'linear-gradient(135deg, #1a1000, #2d1a00)',
      accent: '#fdcb6e',
    },
  },
  // ── 花粉症ケア（hook）
  {
    id: 'pollen-hook',
    gradient: 'radial-gradient(ellipse at 50% 30%, #001a08 0%, #000d04 70%)',
    accent: '#a8e6cf',
    type: 'hook',
    data: {
      eyebrow: '🌿 花粉症でつらいあなたへ',
      headline: '薬に頼らず\n花粉症を\n和らげる',
      sub: '首・背骨の調整で自律神経を整えると\n鼻づまり・くしゃみが軽くなります',
    },
  },
  // ── 花粉症ケア（service）
  {
    id: 'pollen-service',
    gradient: 'linear-gradient(135deg, #001a08, #003015)',
    accent: '#a8e6cf',
    type: 'service',
    data: {
      id: 'pollen',
      icon: '🌿',
      label: '花粉症・アレルギーケア',
      stat: '58%',
      statSub: '花粉症に悩む日本人の割合\n（2人に1人以上）',
      headline: '整骨院で\n花粉症ケア',
      bullets: [
        '🔄 頸椎調整で自律神経バランスを改善',
        '😤 鼻づまり・くしゃみ・目のかゆみが軽減',
        '💊 薬への依存度を下げる体づくり',
        '🛡️ 免疫バランスを整えて体質改善',
      ],
      gradient: 'linear-gradient(135deg, #001a08, #003015)',
      accent: '#a8e6cf',
    },
  },
  // ── 脳梗塞後リハビリ（hook）
  {
    id: 'rehab-hook',
    gradient: 'radial-gradient(ellipse at 40% 60%, #001828 0%, #000c14 70%)',
    accent: '#74b9ff',
    type: 'hook',
    data: {
      eyebrow: '💙 脳梗塞・脳卒中の後遺症に',
      headline: '退院後も\nリハビリを\n続けることが回復の鍵',
      sub: '動き続けることで神経は再生します\n整骨院で専門的なサポートを',
    },
  },
  // ── 脳梗塞後リハビリ（service）
  {
    id: 'rehab-service',
    gradient: 'linear-gradient(135deg, #001828, #003050)',
    accent: '#74b9ff',
    type: 'service',
    data: {
      id: 'rehab',
      icon: '🏥',
      label: '脳梗塞後のリハビリサポート',
      stat: '131万人',
      statSub: '日本の脳梗塞患者数\n（毎年新規30万人が発症）',
      headline: '歩く・動く\n諦めないために',
      bullets: [
        '🚶 歩行訓練・バランス回復サポート',
        '💪 麻痺・筋力低下への専門ケア',
        '🤲 関節可動域・拘縮予防',
        '🧠 継続通院で神経回路の再構築を促進',
      ],
      gradient: 'linear-gradient(135deg, #001828, #003050)',
      accent: '#74b9ff',
    },
  },
  // ── 足裏の痛み（hook）
  {
    id: 'footpain-hook',
    gradient: 'radial-gradient(ellipse at 60% 70%, #1a0800 0%, #0d0400 70%)',
    accent: '#e17055',
    type: 'hook',
    data: {
      eyebrow: '👟 足の裏が痛いあなたへ',
      headline: '朝の一歩目\nかかとの激痛\n放置は危険です',
      sub: '足底筋膜炎は放置すると膝・腰にも影響\nお早めにご相談ください',
    },
  },
  // ── 足裏の痛み（service）
  {
    id: 'footpain-service',
    gradient: 'linear-gradient(135deg, #1a0800, #2d1000)',
    accent: '#e17055',
    type: 'service',
    data: {
      id: 'footpain',
      icon: '👟',
      label: '足裏の痛み・足底筋膜炎',
      stat: '10人に1人',
      statSub: '足裏の痛みを一生に一度は経験する割合',
      headline: 'かかと・足裏の\n痛みを根本から',
      bullets: [
        '🦶 足底筋膜炎・外反母趾・扁平足に対応',
        '⚡ 電気治療×手技で素早く痛みを軽減',
        '📏 インソール・テーピング指導',
        '⚠️ 放置すると膝・腰の二次障害に発展',
      ],
      gradient: 'linear-gradient(135deg, #1a0800, #2d1000)',
      accent: '#e17055',
    },
  },
  // ── 冷え性・レイノー病（hook）
  {
    id: 'cold-hook',
    gradient: 'radial-gradient(ellipse at 30% 40%, #000a20 0%, #000510 70%)',
    accent: '#a8edea',
    type: 'hook',
    data: {
      eyebrow: '🧊 手足の冷え・レイノー病に',
      headline: '冷えは\n体のSOSサイン\n整骨院で改善を',
      sub: 'レイノー病の指が白く・青くなる症状も\n血流・自律神経へのアプローチで改善できます',
    },
  },
  // ── 冷え性・レイノー病（service）
  {
    id: 'cold-service',
    gradient: 'linear-gradient(135deg, #000a20, #001030)',
    accent: '#a8edea',
    type: 'service',
    data: {
      id: 'cold',
      icon: '🧊',
      label: '冷え性・レイノー病',
      stat: '女性の8割',
      statSub: '冷え性を自覚している日本人女性の割合\n（男性は約4割）',
      headline: '手足の冷え・\n血行不良を\n根本から改善',
      bullets: [
        '🩸 血流促進マッサージ・温熱療法',
        '⚡ 自律神経調整で末梢血管の痙攣を緩和',
        '🌡️ レイノー病の発作頻度・強度を軽減',
        '💆 全身の血流改善で冷えにくい体質へ',
      ],
      gradient: 'linear-gradient(135deg, #000a20, #001030)',
      accent: '#a8edea',
    },
  },
];

const ACCIDENT_SLIDES = [
  {
    id: 'accident-zero',
    gradient: 'linear-gradient(135deg, #1a0000, #3a0000)',
    accent: '#ff7675',
    type: 'fact' as const,
    data: {
      stat: '¥0',
      label: '交通事故治療の患者負担',
      sub: '保険会社が治療費を全額負担します\n軽い事故でも・自損事故の同乗者も対象です',
    },
  },
  {
    id: 'accident-warning',
    gradient: 'linear-gradient(135deg, #1a0a00, #3a1500)',
    accent: '#fdcb6e',
    type: 'hook' as const,
    data: {
      eyebrow: '⚠️ 交通事故に遭ったら',
      headline: '痛みがなくても\n必ず受診を',
      sub: 'むち打ち・腰痛・頭痛は数日後に出ることが多い\n「様子見」が症状を悪化させます',
    },
  },
  {
    id: 'accident-unknown',
    gradient: 'linear-gradient(135deg, #001a10, #003020)',
    accent: '#00b894',
    type: 'hook' as const,
    data: {
      eyebrow: '💡 知らなかった？交通事故の豆知識',
      headline: '自損事故でも\n同乗者は治療できます',
      sub: '運転者が加害者・同乗者が被害者となり\n自賠責保険が適用されます（負担0円）',
    },
  },
];

// ═══════════════════════════════════════════════════════════════
//  型定義
// ═══════════════════════════════════════════════════════════════

interface WeatherState { code: number; temp: number; loaded: boolean }
type Period = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface Slide {
  id: string;
  gradient: string;
  accent: string;
  type: 'hook' | 'fact' | 'tip' | 'testimonial' | 'stretch' | 'campaign' | 'menu' | 'qr' | 'service';
  data: Record<string, unknown>;
  duration?: number; // ミリ秒（省略時は SLIDE_MS）
}

// ═══════════════════════════════════════════════════════════════
//  コンテキストヘルパー
// ═══════════════════════════════════════════════════════════════

function getPeriod(): Period {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return 'morning';
  if (h >= 10 && h < 14) return 'midday';
  if (h >= 14 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function getSeason(): Season {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

function getWeatherType(code: number, temp: number): string {
  if (code >= 95) return 'thunder';
  if (code >= 71 && code <= 77) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 45 && code <= 48) return 'cloudy';
  if (code <= 3 && temp <= 5) return 'cold';
  if (code === 0 && temp >= 30) return 'hot';
  return 'clear';
}

// シード付きランダム（時間帯で固定化して同じ時間帯は同じ順序）
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function anonymize(name: string): string {
  if (!name || name.length === 0) return 'Googleユーザー様';
  return name.charAt(0) + '様';
}

function buildSlides(weather: WeatherState, reviewsState?: ReviewsState, dailyContent?: DailyContent): Slide[] {
  const period = getPeriod();
  const season = getSeason();
  const wtype = weather.loaded ? getWeatherType(weather.code, weather.temp) : 'clear';
  const hour = new Date().getHours();
  const rand = seededRandom(hour * 31 + new Date().getDate() * 7);
  const slides: Slide[] = [];

  // ── 1. 時間帯フック ──────────────────────────────────────────
  const timeHooks: Record<Period, { eyebrow: string; headline: string; sub: string; accent: string }> = {
    morning: { accent: '#ff6b9d', eyebrow: '🌅 朝の体チェック', headline: '朝から体が\n重くないですか？', sub: 'そのまま放っておくと慢性化します\n今日こそしっかり整えましょう' },
    midday: { accent: '#fdcb6e', eyebrow: '☀️ お昼休みに', headline: 'デスクワークの\n肩こり・腰痛', sub: '30分でスッキリ軽くなります\nお昼のご来院、大歓迎' },
    afternoon: { accent: '#a29bfe', eyebrow: '⏰ 夕方のだるさ', headline: '体が重く\nなってきませんか？', sub: '朝からのダメージが蓄積しています\n今日のうちにケアを' },
    evening: { accent: '#fd79a8', eyebrow: '🌆 お仕事帰りに', headline: '今日の疲れを\n今日リセット', sub: '帰り道にぜひお立ち寄りください\n体が楽になって帰れます' },
    night: { accent: '#74b9ff', eyebrow: '🌙 夜でも予約できます', headline: '24時間\nLINEで受付中', sub: '深夜のご予約も翌朝すぐ確認します\nお気軽にメッセージください' },
  };
  const th = timeHooks[period];
  slides.push({ id: 'time-hook', gradient: 'radial-gradient(ellipse at 20% 50%, #1a0030 0%, #0d0015 70%)', accent: th.accent, type: 'hook', data: th });

  // ── 2. 天気・季節フック ──────────────────────────────────────
  if (wtype === 'rain' || wtype === 'thunder') {
    slides.push({ id: 'weather', gradient: 'linear-gradient(135deg, #0a1628, #162440)', accent: '#74b9ff', type: 'hook', data: { eyebrow: '🌧️ 雨の日は要注意', headline: '低気圧で体が\nだるくないですか？', sub: '気圧変化が関節痛・頭痛・倦怠感を\n引き起こします。整骨院で解消を' } });
  } else if (wtype === 'hot') {
    slides.push({ id: 'weather', gradient: 'linear-gradient(135deg, #1a0500, #3d1500)', accent: '#fd9644', type: 'hook', data: { eyebrow: '🌡️ 暑い日こそ', headline: '冷房で固まった\n肩・首・腰に', sub: 'エアコンの冷えが血流を悪化させています\n夏こそ整骨院でしっかりケアを' } });
  } else if (wtype === 'cold' || wtype === 'snow') {
    slides.push({ id: 'weather', gradient: 'linear-gradient(135deg, #070720, #0d0d3d)', accent: '#a8edea', type: 'hook', data: { eyebrow: '❄️ 寒い日に', headline: '冷えからくる\n腰痛・肩こり', sub: '寒さで体が縮こまると血流が悪化します\n温めながらしっかり整えます' } });
  } else if (season === 'spring') {
    slides.push({ id: 'season', gradient: 'linear-gradient(135deg, #1a0015, #35002b)', accent: '#ff8fab', type: 'hook', data: { eyebrow: '🌸 春の不調', headline: '寒暖差で\n体が悲鳴を上げています', sub: '春は自律神経が乱れやすい季節です\n早めのケアで体をリセット' } });
  } else if (season === 'summer') {
    slides.push({ id: 'season', gradient: 'linear-gradient(135deg, #1a0a00, #2d1800)', accent: '#ffbe76', type: 'hook', data: { eyebrow: '☀️ 夏バテに', headline: '夏の疲れ\n溜めていませんか？', sub: '暑さと冷房のダブルダメージ\n整骨院で体をリセットしましょう' } });
  } else if (season === 'autumn') {
    slides.push({ id: 'season', gradient: 'linear-gradient(135deg, #1a0800, #2d1000)', accent: '#e17055', type: 'hook', data: { eyebrow: '🍂 秋の変わり目', headline: '体のメンテナンス\nできていますか？', sub: '秋は夏の疲れが出やすい季節です\n定期的なケアで冬に備えましょう' } });
  } else {
    slides.push({ id: 'season', gradient: 'linear-gradient(135deg, #070720, #0d0d3d)', accent: '#a8edea', type: 'hook', data: { eyebrow: '❄️ 冬の体ケア', headline: '冷えからくる\n腰痛・肩こり', sub: '寒さで体が縮こまると血流が悪化します\n温めながらしっかり整えます' } });
  }

  // ── 2.5. 時間帯別ターゲット（凄腕管理人）────────────────────
  const isWeekday = [1, 2, 3, 4, 5].includes(new Date().getDay());
  let targetMsg: { eyebrow: string; headline: string; sub: string } | null = null;
  if (hour >= 8 && hour < 9 && dailyContent?.walkerMessage) {
    targetMsg = dailyContent.walkerMessage;
  } else if (hour >= 9 && hour < 10 && dailyContent?.shopperMessage) {
    targetMsg = dailyContent.shopperMessage;
  } else if (hour >= 15 && hour < 16 && isWeekday && dailyContent?.kidsMessage) {
    targetMsg = dailyContent.kidsMessage;
  }
  if (targetMsg) {
    slides.push({
      id: 'target-audience',
      gradient: 'radial-gradient(ellipse at 75% 50%, #001830 0%, #000d1a 70%)',
      accent: '#00cec9',
      type: 'hook',
      data: targetMsg,
    });
  }

  // ── 3. 健康豆知識（2枚ランダム） ────────────────────────────
  const factIndices = [...Array(HEALTH_FACTS.length).keys()].sort(() => rand() - 0.5).slice(0, 2);
  factIndices.forEach((i, n) => {
    slides.push({ id: `fact-${n}`, gradient: 'linear-gradient(135deg, #0a0020, #1a0040)', accent: '#d63031', type: 'fact', data: HEALTH_FACTS[i] });
  });

  // ── 3.5. 本日のトレンド豆知識（凄腕管理人）─────────────────
  if (dailyContent?.trendingFact) {
    slides.push({
      id: 'daily-trending',
      gradient: 'linear-gradient(135deg, #1a0030, #2d0050)',
      accent: '#e84393',
      type: 'fact',
      data: dailyContent.trendingFact,
    });
  }

  // ── 4. 健康ヒント（2枚ランダム） ────────────────────────────
  const tipIndices = [...Array(HEALTH_TIPS.length).keys()].sort(() => rand() - 0.5).slice(0, 2);
  tipIndices.forEach((i, n) => {
    slides.push({ id: `tip-${n}`, gradient: 'linear-gradient(135deg, #001a10, #003020)', accent: '#00b894', type: 'tip', data: HEALTH_TIPS[i] });
  });

  // ── 4.5. 本日の健康ヒント（凄腕管理人）──────────────────────
  if (dailyContent?.dailyTip) {
    slides.push({
      id: 'daily-tip',
      gradient: 'linear-gradient(135deg, #001020, #002030)',
      accent: '#fdcb6e',
      type: 'tip',
      data: dailyContent.dailyTip,
    });
  }

  // ── 5. お客様の声（Google口コミ優先、なければ手動データ） ──
  // テキスト長に応じて表示時間を算出（100字ごとに4秒追加、最大25秒）
  const reviewDuration = (text: string) => Math.min(25000, 12000 + Math.floor(text.length / 100) * 4000);

  const googleReviews = reviewsState?.reviews ?? [];
  if (googleReviews.length > 0) {
    // Google口コミから2枚ランダムに表示
    const reviewIndices = [...Array(googleReviews.length).keys()].sort(() => rand() - 0.5).slice(0, Math.min(2, googleReviews.length));
    reviewIndices.forEach((i, n) => {
      const r = googleReviews[i];
      slides.push({
        id: `google-review-${n}`,
        gradient: 'linear-gradient(135deg, #0a0800, #201000)',
        accent: '#fdcb6e',
        type: 'testimonial',
        duration: reviewDuration(r.text),
        data: {
          text: r.text,
          person: anonymize(r.author),
          tag: '★'.repeat(r.rating),
          isGoogle: true,
          time: r.time,
          overallRating: reviewsState?.rating,
          totalReviews: reviewsState?.total,
        },
      });
    });
  } else {
    // フォールバック：手動データ
    const testIdx = Math.floor(rand() * TESTIMONIALS.length);
    const t = TESTIMONIALS[testIdx];
    slides.push({ id: 'testimonial', gradient: 'linear-gradient(135deg, #0a0800, #201000)', accent: '#fdcb6e', type: 'testimonial', duration: reviewDuration(String(t.text ?? '')), data: t });
  }

  // ── 6. ストレッチ（1枚） ─────────────────────────────────────
  const stretchIdx = Math.floor(rand() * STRETCHES.length);
  const stretch = STRETCHES[stretchIdx];
  slides.push({ id: 'stretch', gradient: 'linear-gradient(135deg, #001020, #002040)', accent: stretch.accent, type: 'stretch', data: stretch });

  // ── 7. キャンペーン ──────────────────────────────────────────
  const campIdx = Math.floor(rand() * CAMPAIGNS.length);
  const camp = CAMPAIGNS[campIdx];
  slides.push({ id: 'campaign', gradient: 'linear-gradient(135deg, #050520, #0a0a30)', accent: camp.accent, type: 'campaign', data: camp });

  // ── 8. 交通事故治療（常に表示）────────────────────────────
  ACCIDENT_SLIDES.forEach(s => slides.push(s));

  // ── 9. 特別サービス（酸素カプセル・楽トレEMS）─────────────
  SPECIAL_SERVICES.forEach(svc => {
    slides.push({
      id: `service-${svc.id}`,
      gradient: svc.gradient,
      accent: svc.accent,
      type: 'service',
      data: svc,
    });
  });

  // ── 9.5. 追加サービス（6種×hook+service から3枚ランダム選択）
  // hook+serviceをペアで扱い、毎回3ペアを選択してバラけさせる
  const extraPairs: Slide[][] = [];
  for (let i = 0; i < EXTRA_SERVICES.length; i += 2) {
    extraPairs.push([EXTRA_SERVICES[i], EXTRA_SERVICES[i + 1]]);
  }
  const pairIndices = [...Array(extraPairs.length).keys()].sort(() => rand() - 0.5).slice(0, 3);
  pairIndices.forEach(pi => extraPairs[pi].forEach(s => slides.push(s)));

  // ── 10. メニュー ──────────────────────────────────────────────
  slides.push({ id: 'menu', gradient: 'linear-gradient(135deg, #0a0010, #1a0030)', accent: '#d63031', type: 'menu', data: {} });

  // ── 11. QR（最後） ────────────────────────────────────────────
  slides.push({ id: 'qr', gradient: 'linear-gradient(135deg, #0a1628, #051020)', accent: '#00b894', type: 'qr', data: {} });

  return slides;
}

// ═══════════════════════════════════════════════════════════════
//  桜の花びら（常時）
// ═══════════════════════════════════════════════════════════════

interface PetalData { id: number; style: React.CSSProperties }

function SakuraPetals() {
  const [petals, setPetals] = useState<PetalData[]>([]);
  useEffect(() => {
    const r = () => Math.random();
    setPetals(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      style: {
        position: 'absolute' as const,
        left: `${r() * 100}%`,
        top: `-30px`,
        width: `${10 + r() * 10}px`,
        height: `${6 + r() * 6}px`,
        borderRadius: '50% 0 50% 0',
        background: `rgba(255,${150 + Math.floor(r() * 60)},${160 + Math.floor(r() * 60)},${0.3 + r() * 0.35})`,
        transform: `rotate(${r() * 360}deg)`,
        animation: `petal-fall ${5 + r() * 7}s ease-in-out ${r() * 10}s infinite`,
        pointerEvents: 'none' as const,
      },
    })));
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {petals.map(p => <div key={p.id} style={p.style} />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  天気パーティクル
// ═══════════════════════════════════════════════════════════════

interface Particle { id: number; style: React.CSSProperties }

function useParticles(wtype: string): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    const r = () => Math.random();
    if (wtype === 'rain' || wtype === 'thunder') {
      setParticles(Array.from({ length: 90 }, (_, i) => ({ id: i, style: { position: 'absolute' as const, left: `${r() * 100}%`, top: `-80px`, width: '2px', height: `${55 + r() * 40}px`, background: 'linear-gradient(to bottom, transparent, rgba(150,200,255,0.65))', borderRadius: '1px', animation: `rain-fall ${0.55 + r() * 0.35}s linear ${r() * 2}s infinite`, pointerEvents: 'none' as const } })));
    } else if (wtype === 'snow') {
      setParticles(Array.from({ length: 55 }, (_, i) => ({ id: i, style: { position: 'absolute' as const, left: `${r() * 100}%`, top: `-20px`, width: `${5 + r() * 9}px`, height: `${5 + r() * 9}px`, borderRadius: '50%', background: `rgba(255,255,255,${0.6 + r() * 0.4})`, animation: `snow-drift ${3.5 + r() * 4}s ease-in-out ${r() * 6}s infinite`, pointerEvents: 'none' as const } })));
    } else if (wtype === 'hot') {
      setParticles(Array.from({ length: 20 }, (_, i) => ({ id: i, style: { position: 'absolute' as const, left: `${r() * 100}%`, bottom: `${r() * 40}%`, width: `${40 + r() * 60}px`, height: `${40 + r() * 60}px`, borderRadius: '50%', background: `rgba(255,${100 + Math.floor(r() * 80)},0,0.15)`, filter: 'blur(8px)', animation: `heat-rise ${1.5 + r() * 2}s ease-out ${r() * 3}s infinite`, pointerEvents: 'none' as const } })));
    } else if (wtype === 'clear') {
      setParticles(Array.from({ length: 25 }, (_, i) => ({ id: i, style: { position: 'absolute' as const, left: `${r() * 100}%`, top: `${r() * 80}%`, width: `${8 + r() * 8}px`, height: `${8 + r() * 8}px`, background: `rgba(255,230,100,${0.6 + r() * 0.4})`, clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', animation: `sparkle ${1.5 + r() * 2.5}s ease-in-out ${r() * 4}s infinite`, pointerEvents: 'none' as const } })));
    } else if (wtype === 'cloudy') {
      setParticles(Array.from({ length: 6 }, (_, i) => ({ id: i, style: { position: 'absolute' as const, left: `-200px`, top: `${5 + i * 14}%`, width: `${200 + r() * 200}px`, height: `${60 + r() * 80}px`, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(20px)', animation: `cloud-drift ${18 + r() * 20}s linear ${r() * 15}s infinite`, pointerEvents: 'none' as const } })));
    } else {
      setParticles([]);
    }
  }, [wtype]);
  return particles;
}

function WeatherParticles({ wtype }: { wtype: string }) {
  const particles = useParticles(wtype);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {wtype === 'thunder' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(100,150,255,0.15)', animation: 'lightning-flash 4s ease-in-out 1s infinite' }} />}
      {particles.map(p => <div key={p.id} style={p.style} />)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  スライドコンテンツ
// ═══════════════════════════════════════════════════════════════

const LINE_QR = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=000000&bgcolor=ffffff&data=https%3A%2F%2Fpage.line.me%2F520myepf&qzone=2';

// スライドID → 動画ファイルのマッピング
const VIDEO_MAP: Record<string, string> = {
  'time-hook':         '/videos/hero.mp4',
  'target-audience':   '/videos/morning.mp4',
  'service-oxygen':    '/videos/oxygen.mp4',
  'service-ems':       '/videos/ems.mp4',
  'postnatal-hook':    '/videos/postnatal.mp4',
  'keto-hook':         '/videos/treatment.mp4',
  'accident-zero':     '/videos/accident.mp4',
  'accident-warning':  '/videos/accident.mp4',
  'accident-unknown':  '/videos/accident.mp4',
  'qr':                '/videos/night.mp4',
  'daily-trending':    '/videos/treatment.mp4',
};

// スライドID → サービスイメージ画像のマッピング（serviceスライドは左パネル、hook/factは背景）
const IMAGE_MAP: Record<string, string> = {
  'postnatal-service': '/images/postnatal.png',
  'keto-service':      '/images/keto.png',
  'pollen-hook':       '/images/pollen.png',
  'pollen-service':    '/images/pollen.png',
  'rehab-hook':        '/images/treatment.png',
  'rehab-service':     '/images/treatment.png',
  'footpain-hook':     '/images/treatment.png',
  'footpain-service':  '/images/treatment.png',
  'cold-hook':         '/images/treatment.png',
  'cold-service':      '/images/treatment.png',
  'service-oxygen':    '/images/oxygen.png',
  'service-ems':       '/images/ems.png',
  'menu':              '/images/hero.png',
};

function SlideContent({ slide }: { slide: Slide }) {
  const base = (delay = '0s', anim = 'fade-up') => ({
    animation: `${anim} 0.7s cubic-bezier(0.16,1,0.3,1) ${delay} both`,
  });

  if (slide.type === 'hook') {
    const d = slide.data as { eyebrow: string; headline: string; sub: string };
    return (
      <div style={{ maxWidth: '1400px' }}>
        <div style={{ color: slide.accent, fontSize: '38px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '28px', ...base('0s', 'fade-up') }}>{d.eyebrow}</div>
        <h1 style={{ color: 'white', fontSize: '130px', fontWeight: 900, lineHeight: 1.15, whiteSpace: 'pre-line', marginBottom: '44px', letterSpacing: '-0.03em', textShadow: '0 4px 40px rgba(0,0,0,0.5)', ...base('0.12s', 'slide-in-left') }}>{d.headline}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '50px', lineHeight: 1.8, whiteSpace: 'pre-line', ...base('0.28s', 'fade-up') }}>{d.sub}</p>
      </div>
    );
  }

  if (slide.type === 'fact') {
    const d = slide.data as { stat: string; label: string; sub: string };
    return (
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '34px', fontWeight: 600, marginBottom: '20px', ...base('0s', 'fade-up') }}>知っていましたか？</div>
        <div style={{ color: slide.accent, fontSize: '180px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', textShadow: `0 0 80px ${slide.accent}88`, marginBottom: '16px', ...base('0.1s', 'zoom-in') }}>{d.stat}</div>
        <div style={{ color: 'white', fontSize: '64px', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.01em', ...base('0.22s', 'slide-in-bottom') }}>{d.label}</div>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '42px', lineHeight: 1.7, whiteSpace: 'pre-line', ...base('0.34s', 'fade-up') }}>{d.sub}</p>
      </div>
    );
  }

  if (slide.type === 'tip') {
    const d = slide.data as { icon: string; title: string; body: string };
    return (
      <div style={{ maxWidth: '1300px' }}>
        <div style={{ fontSize: '100px', marginBottom: '20px', ...base('0s', 'zoom-in') }}>{d.icon}</div>
        <div style={{ color: slide.accent, fontSize: '36px', fontWeight: 700, marginBottom: '20px', ...base('0.1s', 'fade-up') }}>💡 今日の健康ヒント</div>
        <h1 style={{ color: 'white', fontSize: '112px', fontWeight: 900, lineHeight: 1.2, marginBottom: '36px', letterSpacing: '-0.02em', ...base('0.2s', 'slide-in-left') }}>{d.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '44px', lineHeight: 1.8, whiteSpace: 'pre-line', ...base('0.32s', 'fade-up') }}>{d.body}</p>
      </div>
    );
  }

  if (slide.type === 'testimonial') {
    const d = slide.data as { text: string; person: string; tag: string; isGoogle?: boolean; time?: string; overallRating?: number; totalReviews?: number };
    const stars = d.isGoogle ? d.tag : '⭐⭐⭐⭐⭐';
    const len = (d.text ?? '').length;
    // 文字数に応じてフォントサイズを調整（長いほど小さく）
    const textFontSize = len < 80 ? 52 : len < 150 ? 44 : len < 250 ? 38 : 32;
    // 長文（180字超）は自動スクロール。スクロール量はフォントサイズと行数から推定
    const needsScroll = len > 180;
    const scrollDuration = slide.duration ?? 15000;
    return (
      <div style={{ maxWidth: '1300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', ...base('0s', 'fade-up') }}>
          {d.isGoogle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', padding: '10px 28px' }}>
              <span style={{ fontSize: '32px' }}>G</span>
              <span style={{ color: 'white', fontSize: '28px', fontWeight: 700 }}>Google口コミ</span>
            </div>
          )}
          <div style={{ color: slide.accent, fontSize: '36px', fontWeight: 700 }}>
            {d.isGoogle ? `${stars}　実際のお客様の声` : '⭐⭐⭐⭐⭐　患者様の声'}
          </div>
        </div>
        {d.isGoogle && d.overallRating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', ...base('0.08s', 'fade-up') }}>
            <span style={{ color: '#fdcb6e', fontSize: '72px', fontWeight: 900 }}>{d.overallRating}</span>
            <div>
              <div style={{ color: '#fdcb6e', fontSize: '36px' }}>{'★'.repeat(Math.round(d.overallRating))}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '28px' }}>Google 総合評価（{d.totalReviews}件）</div>
            </div>
          </div>
        )}
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '24px', padding: '40px 56px', borderLeft: `5px solid ${slide.accent}`, overflow: 'hidden', maxHeight: needsScroll ? '420px' : 'none', ...base('0.14s', 'slide-in-bottom') }}>
          <div style={needsScroll ? {
            animation: `review-scroll ${scrollDuration * 0.75}ms ease-in-out ${scrollDuration * 0.1}ms both`,
          } : {}}>
            <p style={{ color: 'white', fontSize: `${textFontSize}px`, fontWeight: 600, lineHeight: 1.8, marginBottom: '28px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>「{d.text}」</p>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '30px' }}>
              {d.person}{d.time ? `　${d.time}` : ''}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === 'stretch') {
    const d = slide.data as { name: string; icon: string; steps: string[]; accent: string };
    return (
      <div style={{ width: '100%' }}>
        <div style={{ color: slide.accent, fontSize: '36px', fontWeight: 700, marginBottom: '24px', ...base('0s', 'fade-up') }}>🏃 今すぐできる！</div>
        <div style={{ fontSize: '80px', marginBottom: '8px', ...base('0.1s', 'zoom-in') }}>{d.icon}</div>
        <h1 style={{ color: 'white', fontSize: '88px', fontWeight: 900, marginBottom: '48px', letterSpacing: '-0.02em', ...base('0.2s', 'slide-in-left') }}>{d.name}</h1>
        <div style={{ display: 'flex', gap: '28px' }}>
          {d.steps.map((step, i) => (
            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '20px', padding: '32px', borderTop: `3px solid ${slide.accent}`, animation: `fade-up 0.7s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.1}s both` }}>
              <div style={{ color: slide.accent, fontSize: '52px', fontWeight: 900, marginBottom: '16px' }}>{i + 1}</div>
              <div style={{ color: 'white', fontSize: '38px', fontWeight: 600, lineHeight: 1.5 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === 'campaign') {
    const d = slide.data as { icon: string; title: string; body: string; detail: string; accent: string };
    return (
      <div style={{ maxWidth: '1200px', textAlign: 'center', margin: '0 auto' }}>
        <div style={{ fontSize: '120px', marginBottom: '24px', ...base('0s', 'zoom-in') }}>{d.icon}</div>
        <div style={{ color: slide.accent, fontSize: '38px', fontWeight: 700, marginBottom: '24px', letterSpacing: '0.05em', ...base('0.12s', 'fade-up') }}>🎉 サクラ整骨院からのご案内</div>
        <h1 style={{ color: 'white', fontSize: '100px', fontWeight: 900, lineHeight: 1.25, marginBottom: '32px', letterSpacing: '-0.02em', whiteSpace: 'pre-line', ...base('0.22s', 'slide-in-bottom') }}>{d.body}</h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '44px', ...base('0.34s', 'fade-up') }}>{d.detail}</p>
      </div>
    );
  }

  if (slide.type === 'service') {
    const d = slide.data as typeof SPECIAL_SERVICES[0];
    const imgSrc = IMAGE_MAP[slide.id];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '60px', width: '100%' }}>
        {/* 左：サービスイメージ or 大きな数字 */}
        {imgSrc ? (
          <div style={{ flex: '0 0 440px', height: '420px', position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: `0 0 60px ${slide.accent}55`, ...base('0s', 'zoom-in') }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt={d.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* グラデーションオーバーレイ */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)` }} />
            {/* 数字オーバーレイ */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ color: slide.accent, fontSize: '86px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', textShadow: `0 0 40px ${slide.accent}` }}>{d.stat}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '26px', fontWeight: 600, marginTop: '8px', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{d.statSub}</div>
            </div>
          </div>
        ) : (
          <div style={{ flex: '0 0 480px', textAlign: 'center', ...base('0s', 'zoom-in') }}>
            <div style={{ fontSize: '72px', marginBottom: '8px' }}>{d.icon}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '30px', fontWeight: 600, marginBottom: '8px' }}>
              {d.label}
            </div>
            <div style={{
              color: slide.accent, fontSize: '110px', fontWeight: 900, lineHeight: 1,
              letterSpacing: '-0.04em', textShadow: `0 0 60px ${slide.accent}99`,
            }}>
              {d.stat}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '34px', fontWeight: 600, marginTop: '12px', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
              {d.statSub}
            </div>
          </div>
        )}

        {/* 縦区切り */}
        <div style={{ width: '2px', alignSelf: 'stretch', background: `linear-gradient(to bottom, transparent, ${slide.accent}88, transparent)` }} />

        {/* 右：見出し＋箇条書き */}
        <div style={{ flex: 1 }}>
          <div style={{ color: slide.accent, fontSize: '34px', fontWeight: 700, marginBottom: '20px', ...base('0.1s', 'fade-up') }}>
            ✨ 当院の特別メニュー
          </div>
          <h1 style={{ color: 'white', fontSize: '80px', fontWeight: 900, lineHeight: 1.25, whiteSpace: 'pre-line', marginBottom: '36px', letterSpacing: '-0.02em', ...base('0.18s', 'slide-in-left') }}>
            {d.headline}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {d.bullets.map((b, i) => (
              <div key={i} style={{
                color: 'rgba(255,255,255,0.85)', fontSize: '38px', fontWeight: 500,
                animation: `fade-up 0.6s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.08}s both`,
              }}>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === 'menu') {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ color: slide.accent, fontSize: '38px', fontWeight: 700, marginBottom: '24px', ...base('0s', 'fade-up') }}>🩺 サクラ整骨院のメニュー</div>
        <h1 style={{ color: 'white', fontSize: '88px', fontWeight: 900, lineHeight: 1.2, marginBottom: '48px', letterSpacing: '-0.02em', ...base('0.12s', 'slide-in-left') }}>症状に合わせた 3つのプラン</h1>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { icon: '🏥', title: '保険診療', body: '健康保険が使えます\n窓口負担を抑えて通えます', tag: '保険OK' },
            { icon: '✨', title: '自費施術', body: '症状に合わせた専門施術\nより根本的なアプローチ', tag: '専門的' },
            { icon: '♾️', title: 'サブスク 月額7,800円', body: '60分施術（8,000円相当）毎月1回\n＋施術ごとに10%OFF', tag: 'お得' },
          ].map((item, i) => (
            <div key={item.title} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px', borderTop: `3px solid ${slide.accent}`, animation: `slide-in-bottom 0.7s cubic-bezier(0.16,1,0.3,1) ${0.22 + i * 0.1}s both` }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>{item.icon}</div>
              <div style={{ background: slide.accent, color: '#000', fontSize: '22px', fontWeight: 700, padding: '4px 16px', borderRadius: '100px', display: 'inline-block', marginBottom: '16px' }}>{item.tag}</div>
              <div style={{ color: 'white', fontSize: '40px', fontWeight: 700, marginBottom: '16px' }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '32px', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // qr
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '80px', width: '100%' }}>
      <div style={{ flex: 1, ...base('0s', 'slide-in-left') }}>
        <div style={{ color: slide.accent, fontSize: '38px', fontWeight: 700, marginBottom: '28px' }}>📱 LINEで今すぐ予約</div>
        <h1 style={{ color: 'white', fontSize: '112px', fontWeight: 900, lineHeight: 1.2, whiteSpace: 'pre-line', marginBottom: '40px', letterSpacing: '-0.02em' }}>{'QRコードを\n読み取ってください'}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {['24時間いつでも予約受付中', '完全予約制でお待たせしません', 'スタッフが丁寧に対応します'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'rgba(255,255,255,0.78)', fontSize: '40px', animation: `fade-up 0.6s ease ${0.2 + i * 0.1}s both` }}>
              <span style={{ color: slide.accent }}>✓</span> {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: '28px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: `0 0 80px ${slide.accent}55`, flexShrink: 0, ...base('0.15s', 'zoom-in') }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LINE_QR} alt="LINE QR" width={300} height={300} style={{ display: 'block', borderRadius: '4px' }} />
        <div style={{ color: '#06c755', fontSize: '30px', fontWeight: 700 }}>LINE 友だち追加</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  メインコンポーネント
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  Google口コミ型
// ═══════════════════════════════════════════════════════════════

interface GoogleReview {
  text: string;
  rating: number;
  author: string;
  time: string;
}

interface ReviewsState {
  reviews: GoogleReview[];
  rating: number;
  total: number;
  configured: boolean;
  loaded: boolean;
}

interface DailyContent {
  dailyTip?: { icon: string; title: string; body: string };
  trendingFact?: { stat: string; label: string; sub: string };
  walkerMessage?: { eyebrow: string; headline: string; sub: string };
  shopperMessage?: { eyebrow: string; headline: string; sub: string };
  kidsMessage?: { eyebrow: string; headline: string; sub: string };
  source?: string;
}

const SLIDE_MS = 10000;
const WEATHER_MS = 10 * 60 * 1000;
const REVIEWS_MS = 60 * 60 * 1000; // 1時間ごと

export default function SignagePage() {
  const [weather, setWeather] = useState<WeatherState>({ code: 0, temp: 20, loaded: false });
  const [reviewsState, setReviewsState] = useState<ReviewsState>({ reviews: [], rating: 0, total: 0, configured: false, loaded: false });
  const [dailyContent, setDailyContent] = useState<DailyContent | undefined>(undefined);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [now, setNow] = useState(new Date());
  const [progressKey, setProgressKey] = useState(0);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.8&longitude=135.2&current=temperature_2m,weathercode&timezone=Asia/Tokyo');
      const d = await res.json();
      setWeather({ code: d.current.weathercode, temp: Math.round(d.current.temperature_2m), loaded: true });
    } catch { /* fallback */ }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      const d = await res.json();
      setReviewsState({ ...d, loaded: true });
    } catch {
      setReviewsState(prev => ({ ...prev, loaded: true }));
    }
  }, []);

  const fetchDailyContent = useCallback(async () => {
    try {
      const res = await fetch('/api/daily-content');
      const d = await res.json();
      setDailyContent(d);
    } catch { /* フォールバックは buildSlides が静的コンテンツで対応 */ }
  }, []);

  const DAILY_MS = 6 * 60 * 60 * 1000; // 6時間

  useEffect(() => {
    fetchWeather();
    fetchReviews();
    fetchDailyContent();
    const wt = setInterval(fetchWeather, WEATHER_MS);
    const rt = setInterval(fetchReviews, REVIEWS_MS);
    const dt = setInterval(fetchDailyContent, DAILY_MS);
    const ct = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(wt); clearInterval(rt); clearInterval(dt); clearInterval(ct); };
  }, [fetchWeather, fetchReviews, fetchDailyContent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setSlides(buildSlides(weather, reviewsState, dailyContent)); }, [weather, reviewsState, dailyContent]);

  useEffect(() => {
    if (now.getMinutes() === 0 && now.getSeconds() === 0) setSlides(buildSlides(weather, reviewsState, dailyContent));
  }, [now, weather, reviewsState, dailyContent]);

  useEffect(() => {
    if (!slides.length) return;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = (currentIdx: number) => {
      const dur = slides[currentIdx]?.duration ?? SLIDE_MS;
      timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          const next = (currentIdx + 1) % slides.length;
          setIdx(next);
          setVisible(true);
          setProgressKey(k => k + 1);
          scheduleNext(next);
        }, 700);
      }, dur);
    };
    scheduleNext(idx);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides]);

  const wtype = useMemo(() => weather.loaded ? getWeatherType(weather.code, weather.temp) : 'clear', [weather]);

  if (!slides.length) return null;

  const slide = slides[idx];
  const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <div style={{ width: '100vw', height: '100vh', background: slide.gradient, opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif' }}>

      {/* 動画背景（スライド対応のもののみ） */}
      {VIDEO_MAP[slide.id] && (
        <video
          key={slide.id}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.28,
            zIndex: 0,
            pointerEvents: 'none',
          }}
          src={VIDEO_MAP[slide.id]}
        />
      )}

      {/* 背景イメージ（hook/factスライド、VIDEO_MAPがないスライドに表示） */}
      {!VIDEO_MAP[slide.id] && IMAGE_MAP[slide.id] && slide.type !== 'service' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`bg-${slide.id}`}
          src={IMAGE_MAP[slide.id]}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.22,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 背景エフェクト */}
      <SakuraPetals />
      <WeatherParticles wtype={wtype} />

      {/* プログレスバー */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.1)', zIndex: 10 }}>
        <div key={progressKey} style={{ height: '100%', background: slide.accent, animation: `progress-fill ${slide.duration ?? SLIDE_MS}ms linear both`, boxShadow: `0 0 8px ${slide.accent}` }} />
      </div>

      {/* トップバー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 64px 0', color: 'rgba(255,255,255,0.55)', fontSize: '30px', fontWeight: 500, position: 'relative', zIndex: 1 }}>
        <span>🌸 サクラ整骨院</span>
        <span>{dateStr}　{timeStr}</span>
        <span>{weather.loaded ? `${weather.temp}°C` : '\u00A0\u00A0\u00A0\u00A0'}</span>
      </div>

      {/* メインコンテンツ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '20px 80px 0', position: 'relative', zIndex: 1 }}>
        <div key={slide.id} style={{ width: '100%' }}>
          <SlideContent slide={slide} />
        </div>
      </div>

      {/* ボトムバー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 64px 28px', color: 'rgba(255,255,255,0.35)', fontSize: '26px', position: 'relative', zIndex: 1 }}>
        <span>神戸市北区 ／ 予約はLINEへ</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {slides.map((_, i) => (
            <div key={i} style={{ width: i === idx ? '36px' : '10px', height: '10px', borderRadius: '5px', background: i === idx ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)', transition: 'all 0.4s ease' }} />
          ))}
        </div>
        <span>LINE ID: @520myepf</span>
      </div>
    </div>
  );
}

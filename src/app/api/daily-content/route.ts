import { NextResponse } from 'next/server';

export const revalidate = 21600; // 6時間キャッシュ

export interface DailyContent {
  dailyTip: { icon: string; title: string; body: string };
  trendingFact: { stat: string; label: string; sub: string };
  walkerMessage: { eyebrow: string; headline: string; sub: string };
  shopperMessage: { eyebrow: string; headline: string; sub: string };
  kidsMessage: { eyebrow: string; headline: string; sub: string };
  source: 'gemini' | 'static';
}

// ── 静的フォールバックコンテンツ（日付ローテーション） ──────────

const FALLBACK_TIPS = [
  { icon: '🧘', title: '朝の1分体操で腰痛予防', body: '起き上がり前に布団の上で膝を\n抱えて10秒キープするだけで腰痛リスクが下がります' },
  { icon: '💧', title: '朝一番の白湯で腸活スタート', body: '起床後の白湯200mlが腸を目覚めさせます\n体重管理にも効果的です' },
  { icon: '👁️', title: '20-20-20ルールで目の疲れ解消', body: '20分ごとに20フィート先を20秒眺めるだけで\n眼精疲労が大幅に回復します' },
  { icon: '🦷', title: '食後30分後の歯磨きが効果的', body: '食後すぐより酸性が中和された後に磨くと\nエナメル質を守れます' },
  { icon: '😴', title: '昼寝は20分が最適', body: '20分の昼寝は夜の2時間分の\n疲労回復効果があります' },
  { icon: '🏃', title: '階段利用で足腰を日々強化', body: 'エレベーターより階段を選ぶだけで\n足腰の筋力維持に大きく貢献します' },
  { icon: '🌡️', title: '体温1度アップで免疫力が変わる', body: '体温が1度下がると免疫力は約30%低下\n体を温める生活習慣が大切です' },
  { icon: '🧠', title: '深呼吸でストレスを即リセット', body: '4秒吸って8秒吐く深呼吸を3回繰り返すと\n自律神経が整い肩の緊張が緩みます' },
  { icon: '🦴', title: 'カルシウムはビタミンDと一緒に', body: '牛乳・豆腐に加えて日光を浴びることで\nビタミンDが生成され骨密度を守ります' },
  { icon: '🌙', title: '就寝90分前の入浴が快眠の鍵', body: '体温が下がるタイミングで入眠すると\n深い睡眠が得られ翌朝の疲労感が違います' },
  { icon: '🦶', title: '足指もみで全身の血流改善', body: 'テレビを見ながら足指をグルグル回すだけで\n足腰の血流が改善され冷えも解消' },
  { icon: '🪑', title: '坐骨で深く座ることが腰痛予防に', body: '椅子に浅く腰掛けると腰への負担大\n深く座って背もたれを活用しましょう' },
  { icon: '🌊', title: '水を1日1.5L飲んで椎間板を守る', body: '椎間板の80%は水分でできています\n水分不足が腰痛・肩こりを悪化させます' },
  { icon: '⏰', title: '1時間に1回の立ち上がりが体を守る', body: '座り続けると腰への負担は立位の2倍\nこまめな休憩が慢性痛を予防します' },
];

const FALLBACK_FACTS = [
  { stat: '72.5%', label: '肩こり・首こりに悩む日本人の割合', sub: '30〜40代では75.3%\n実は整骨院で改善できる国民病です' },
  { stat: '3倍', label: '定期メンテナンスで怪我を予防できる確率', sub: '月1回の通院で急性症状が大幅に減少\n予防こそが最高の治療です' },
  { stat: '27kg', label: 'スマホを見るときの首への負担', sub: 'たった30度の前傾みで27kgもの負担\n首こり・頭痛の原因はここにあります' },
  { stat: '8割', label: '整骨院を継続利用した腰痛患者の改善率', sub: '適切な施術と生活指導の組み合わせで\n多くの方が改善を実感しています' },
  { stat: '6倍', label: '猫背のとき椎間板にかかる負担', sub: '正しい姿勢と比べて背骨への負荷が6倍\n姿勢を整えるだけで腰痛が激減します' },
  { stat: '45分', label: '座り続けると腰痛リスクが高まる時間', sub: '45分を超えたら必ず立ち上がりを\n整骨院での定期ケアと組み合わせると効果的' },
  { stat: '1,000万人', label: '腰痛に悩む日本人の推定数', sub: '腰痛は日本人の愁訴第1位\n多くは整骨院で改善できます' },
  { stat: '30%', label: '体温1度低下による免疫力の低下率', sub: '冷えは万病のもと\n体を温めるケアで健康を守りましょう' },
];

const FALLBACK_WALKER = [
  { eyebrow: '🌅 朝の散歩帰りに', headline: '体を動かした後こそ\n整骨院でリセット', sub: '筋肉がほぐれた今が最高のタイミング\nウォーキング後の疲れをそのままにしないで' },
  { eyebrow: '🌸 朝の散歩帰りのあなたへ', headline: '体を動かした後の\nケアが一番効く', sub: '散歩で活性化した筋肉をプロが整えます\nそのまま帰るともったいない！' },
  { eyebrow: '🏃 朝のウォーキング後に', headline: '毎朝の散歩が\nもっと体に良くなる', sub: '定期的な施術と組み合わせると\nウォーキングの効果が倍増します' },
  { eyebrow: '🌄 早起きのあなたへ', headline: '朝活の締めは\n体のメンテナンスで', sub: '散歩・体操・整骨院の三位一体\n健康な毎日への最短ルートです' },
];

const FALLBACK_SHOPPER = [
  { eyebrow: '🛒 お買い物帰りに', headline: '重い荷物で\n肩がパンパンに', sub: '買い物袋の重さで肩・腰に想像以上の負担\nそのまま帰る前に立ち寄りませんか？' },
  { eyebrow: '🛍️ コープ帰りのあなたへ', headline: '毎週の買い物で\n腰が悲鳴を上げていませんか？', sub: '重い荷物を運び続けることで\n腰への蓄積ダメージは計り知れません' },
  { eyebrow: '🧺 買い物後の肩の重さ', headline: 'ちょっと寄って\Xいきませんか？', sub: '10分のご相談でも大歓迎\n体の気になること何でもお聞きします' },
  { eyebrow: '🥕 今日のお買い物ついでに', headline: '主婦の体こそ\n定期メンテナンスを', sub: '家事・買い物・育児で酷使する体\nプロの手で整えましょう' },
];

const FALLBACK_KIDS = [
  { eyebrow: '🎒 学校帰りのご家族へ', headline: 'ランドセルで\n子どもの姿勢が心配', sub: '小学生の3人に1人が姿勢の問題を抱えています\n成長期の早期ケアが将来を変えます' },
  { eyebrow: '👦 お子さまの体のこと', headline: 'ゲーム・スマホで\n子どもの首が心配', sub: '成長期の歪みは早めに対処することが\n将来の健康につながります' },
  { eyebrow: '🏫 放課後の時間に', headline: 'お子さまと一緒に\n体のチェックを', sub: '子どもも大人も一緒に来院OK\n家族で健康を管理しましょう' },
  { eyebrow: '⚽ スポーツをするお子さまへ', headline: '練習後のケアが\n成長の差を生む', sub: '子どものスポーツ障害は放置すると深刻に\n早めの相談がおすすめです' },
];

function getDayIndex(len: number): number {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return dayOfYear % len;
}

async function generateWithGemini(): Promise<Omit<DailyContent, 'source'> | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const month = now.getMonth() + 1;
  const season = month >= 3 && month <= 5 ? '春' : month >= 6 && month <= 8 ? '夏' : month >= 9 && month <= 11 ? '秋' : '冬';

  const prompt = `今日は${dateStr}（${season}）です。神戸市北区にあるサクラ整骨院のデジタルサイネージ用コンテンツをJSON形式で生成してください。

以下のJSON形式のみで回答してください（説明文不要）：
{
  "dailyTip": {
    "icon": "絵文字1つ",
    "title": "健康ヒントのタイトル（20文字以内）",
    "body": "本文（60文字以内、\\nで改行可）"
  },
  "trendingFact": {
    "stat": "印象的な数字・記号（例：72%、3倍、¥0）",
    "label": "その数字の説明（25文字以内）",
    "sub": "補足説明（55文字以内、\\nで改行可）"
  },
  "walkerMessage": {
    "eyebrow": "🌅または🌸から始まる一言（20文字以内）",
    "headline": "朝の散歩客への呼びかけ（20文字以内、\\nで改行可）",
    "sub": "補足（55文字以内、\\nで改行可）"
  },
  "shopperMessage": {
    "eyebrow": "🛒または🛍️から始まる一言（20文字以内）",
    "headline": "買い物帰りへの呼びかけ（20文字以内、\\nで改行可）",
    "sub": "補足（55文字以内、\\nで改行可）"
  },
  "kidsMessage": {
    "eyebrow": "🎒または⚽から始まる一言（20文字以内）",
    "headline": "下校時の子ども・保護者への呼びかけ（20文字以内、\\nで改行可）",
    "sub": "補足（55文字以内、\\nで改行可）"
  }
}

条件：
- すべて日本語
- 今日の日付・曜日・季節を意識した内容（月曜なら週始め、金曜なら週末前、${season}らしいテーマ）
- 整骨院への来院を自然に促す内容
- 親しみやすく押しつけがましくない文体
- 日替わりで新鮮に感じられる内容`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.85, maxOutputTokens: 1024 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET() {
  const generated = await generateWithGemini();

  if (generated) {
    return NextResponse.json({ ...generated, source: 'gemini' });
  }

  // 静的フォールバック（日付ローテーション）
  return NextResponse.json({
    dailyTip: FALLBACK_TIPS[getDayIndex(FALLBACK_TIPS.length)],
    trendingFact: FALLBACK_FACTS[getDayIndex(FALLBACK_FACTS.length)],
    walkerMessage: FALLBACK_WALKER[getDayIndex(FALLBACK_WALKER.length)],
    shopperMessage: FALLBACK_SHOPPER[getDayIndex(FALLBACK_SHOPPER.length)],
    kidsMessage: FALLBACK_KIDS[getDayIndex(FALLBACK_KIDS.length)],
    source: 'static',
  } satisfies DailyContent);
}

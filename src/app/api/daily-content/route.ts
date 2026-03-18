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
  { icon: '🤸', title: '肩甲骨を動かして肩こり解消', body: '両肩をグルグル回すだけで\n肩甲骨周りの血流が改善します\n仕事の合間に試してみて' },
  { icon: '🌿', title: '緑茶でリラックス効果アップ', body: 'テアニンが神経を落ち着かせ\n首・肩の緊張をほぐす効果があります\n休憩時間に一杯どうぞ' },
  { icon: '👂', title: '耳たぶマッサージで自律神経を整える', body: '耳たぶを軽く引っ張って離すだけで\n頭痛・眼精疲労の緩和に効果的です' },
  { icon: '🌞', title: '朝日を浴びて体内時計をリセット', body: '起床後30分以内に朝日を10分浴びると\n睡眠ホルモンが正常化し疲れが取れやすくなります' },
  { icon: '💪', title: 'プランクで体幹を鍛えて腰痛予防', body: '30秒のプランクを毎日続けるだけで\n腰を支える体幹筋が強化されます' },
  { icon: '🧊', title: '急性の痛みにはまず冷やす', body: 'ぶつけた・ひねったは48時間は冷却が基本\n温めると炎症が悪化する場合があります' },
  { icon: '🍌', title: 'バナナで筋肉の回復を早める', body: 'カリウムが豊富なバナナは\n運動後の筋肉痙攣・こむら返りを予防します' },
  { icon: '🧴', title: 'お風呂上がりにストレッチを', body: '体が温まった入浴後10分が\n筋肉の柔軟性が最も高まるゴールデンタイムです' },
  { icon: '📵', title: '就寝1時間前のスマホをやめる', body: 'ブルーライトが睡眠ホルモンを阻害します\n睡眠の質が下がると体の回復力も落ちます' },
  { icon: '🎵', title: '音楽で運動効率を上げる', body: 'テンポ120〜130BPMの音楽は\nウォーキングのペースを自然に上げ\n脂肪燃焼効果も高まります' },
  { icon: '🥚', title: 'タンパク質で筋肉・腱を修復', body: '筋肉・腱・靭帯はタンパク質で作られます\n毎食手のひら1枚分のタンパク質を摂りましょう' },
  { icon: '🌬️', title: 'あくびは脳の冷却サイン', body: '頻繁なあくびは脳が疲れているサインです\n5分の目閉じ休憩で集中力が回復します' },
  { icon: '🦵', title: 'ふくらはぎは第二の心臓', body: 'ふくらはぎを動かすことで\n下肢の血液を心臓へ送り返すポンプになります\n立仕事の人は特に意識して' },
  { icon: '🫁', title: '腹式呼吸で体幹を強化', body: 'お腹を膨らませる腹式呼吸を毎日3分\n腰を支えるインナーマッスルが自然と鍛えられます' },
  { icon: '🏊', title: '水中ウォーキングで膝に優しい運動', body: '水の浮力で体重が約10分の1になります\n膝・腰に痛みがある方に特におすすめです' },
  { icon: '🌺', title: '花の香りで気持ちをリセット', body: 'ラベンダーの香りは副交感神経を刺激し\n肩の力が自然と抜けていきます' },
  { icon: '🎯', title: '小さな目標設定が健康習慣の鍵', body: '「今日は10分歩く」など小さな目標から始めると\n習慣化しやすく体への変化も積み重なります' },
  { icon: '🫶', title: '手首のストレッチでPC疲れを解消', body: '手首を前後に10秒ずつ倒すだけで\n腱鞘炎・肘の痛みの予防になります' },
  { icon: '🍵', title: '食後のウォーキングで血糖値を安定', body: '食後15分のウォーキングが\n血糖値の急上昇を防ぎ体重管理にも効果的です' },
  { icon: '🌙', title: '寝る前に感謝日記を書く', body: '良かったことを3つ書くだけで\nストレスホルモンが下がり\n体の回復力が高まります' },
  { icon: '🔥', title: 'ホットアイマスクで眼精疲労解消', body: '蒸しタオルを目に当てて5分\n目の疲れが取れると首・肩のこりも和らぎます' },
  { icon: '🧩', title: '左右均等に荷物を持つ習慣を', body: 'いつも同じ側に荷物を持つと\n体の歪みにつながります\n定期的に左右を変えましょう' },
  { icon: '🏡', title: '家事は体幹トレーニング', body: '掃除機・洗濯は全身を使う運動です\n姿勢を意識するだけでトレーニング効果が倍増します' },
  { icon: '💤', title: '横向き寝には抱き枕を活用', body: '横向きで寝る方は抱き枕で\n腰・膝の負担を大幅に軽減できます' },
  { icon: '🌅', title: '起きたらまず水を飲む', body: '就寝中に失われた水分を補給することで\n血液がサラサラになり代謝がアップします' },
  { icon: '🤾', title: '肩回しで四十肩を予防', body: '毎日腕を大きく10回ずつ回すだけで\n肩関節の可動域を保てます\n四十肩・五十肩の予防に効果的です' },
  { icon: '🦷', title: '歯ぎしりは体の緊張のサイン', body: '歯ぎしりが多い方は首・肩・顎が\n慢性的に緊張している状態です\n整骨院での施術が効果的です' },
  { icon: '🧘', title: '正座で骨盤を整える', body: '1日3分の正座が\n骨盤の歪みを整え\n腰痛・生理痛の改善に役立ちます' },
  { icon: '🏋️', title: 'スクワットで全身の代謝アップ', body: '10回のスクワットを毎日続けるだけで\n足腰の筋肉が強化され\n腰痛予防と代謝向上が同時に叶います' },
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
  { stat: '2,600時間', label: '日本人が1年間座っている平均時間', sub: '世界一の「座りすぎ大国」日本\n腰・股関節への蓄積ダメージは深刻です' },
  { stat: '3人に1人', label: '40代で腰痛を経験する人の割合', sub: '放置すると慢性化するリスクが高まります\n早めのケアが大切です' },
  { stat: '49kg', label: '60度前傾時の頸椎にかかる負荷', sub: 'スマホを見る姿勢が続くと\n首の骨・筋肉に計り知れないダメージが蓄積します' },
  { stat: '5cm', label: '猫背で縮む身長の目安', sub: '姿勢を整えると見た目も若返り\n整骨院での施術が即効性を発揮します' },
  { stat: '週2回', label: '理想的な整骨院通院頻度（急性期）', sub: '急性症状は集中的にケアすることで\n回復期間を大幅に短縮できます' },
  { stat: '7,800円', label: 'サクラ整骨院サブスク月額（通い放題）', sub: '毎日来院しても月定額\n体を本気でメンテナンスしたい方に最適です' },
  { stat: '80%', label: 'デスクワーカーが抱える肩こりの割合', sub: 'テレワーク普及で急増しています\n整骨院での定期ケアが予防の近道です' },
  { stat: '2倍', label: '座位と比べた前傾姿勢の腰への負担', sub: '立って作業するだけで腰痛リスクが大幅減\nスタンディングデスクも有効です' },
  { stat: '10kg', label: '毎日のランドセルの平均重量（小学生）', sub: '成長期の子どもの脊柱に大きな負担\n親子で定期的に姿勢チェックを' },
  { stat: '15分', label: '整骨院施術後の効果が出始めるまでの目安', sub: '施術直後から体が軽くなる方が多いです\nまずは1回体験してみてください' },
  { stat: '女性1位', label: '肩こりが女性の愁訴ランキング', sub: '1,000人あたり約120人が悩む症状\n整骨院で根本から改善できます' },
  { stat: '26個', label: '背骨を構成する椎骨の数', sub: 'どこか一つでもズレると全身に影響\n定期的な整体で全体を整えましょう' },
  { stat: '1/3', label: '人生の中で睡眠に費やす時間', sub: '睡眠姿勢が悪いと回復どころか\n体に負担をかけ続けることになります' },
  { stat: '4倍', label: '運動習慣のある人の整骨院回復速度', sub: '適度な運動が治癒力を高めます\n通院と運動の組み合わせが最強です' },
  { stat: '¥0', label: '健康保険適用施術の患者負担額（例）', sub: '急性の捻挫・打撲・肉離れなどは\n保険が使えます。まずはご相談を' },
  { stat: '8時間', label: '成人に必要な理想の睡眠時間', sub: '6時間未満が続くと免疫力・回復力が激減\n体のメンテナンスは睡眠から始まります' },
  { stat: '20代から', label: '椎間板の老化が始まる年齢', sub: '早めのケアで老化を遅らせることができます\n整骨院での定期メンテナンスが効果的です' },
  { stat: '60%', label: 'ストレスが原因の肩こり・腰痛の割合', sub: '心身両面からアプローチする整骨院の施術は\nストレス性の症状にも効果的です' },
  { stat: '10分', label: 'ウォーキングで気分が改善される時間', sub: '歩くだけで幸せホルモンが分泌されます\nウォーキング後に整骨院でケアすると更に効果的' },
  { stat: '3ヶ月', label: '生活習慣を変えると体が変わる目安期間', sub: '施術+生活習慣の改善の組み合わせで\n根本から体質を変えることができます' },
  { stat: '毎朝', label: '体の変化に気づく最良のタイミング', sub: '起床時の体のこわばりや痛みは要注意サイン\n早めに整骨院でチェックしてもらいましょう' },
  { stat: '5分', label: '肩甲骨ストレッチで肩こりが和らぐ時間', sub: '両手を組んで上に伸ばすだけで\n肩甲骨周りの血流が改善されます' },
];

const FALLBACK_WALKER = [
  { eyebrow: '🌅 朝の散歩帰りに', headline: '体を動かした後こそ\n整骨院でリセット', sub: '筋肉がほぐれた今が最高のタイミング\nウォーキング後の疲れをそのままにしないで' },
  { eyebrow: '🌸 朝の散歩帰りのあなたへ', headline: '体を動かした後の\nケアが一番効く', sub: '散歩で活性化した筋肉をプロが整えます\nそのまま帰るともったいない！' },
  { eyebrow: '🏃 朝のウォーキング後に', headline: '毎朝の散歩が\nもっと体に良くなる', sub: '定期的な施術と組み合わせると\nウォーキングの効果が倍増します' },
  { eyebrow: '🌄 早起きのあなたへ', headline: '朝活の締めは\n体のメンテナンスで', sub: '散歩・体操・整骨院の三位一体\n健康な毎日への最短ルートです' },
  { eyebrow: '☀️ 朝のお散歩お疲れ様です', headline: 'ウォーキングの効果を\nもっと高める方法があります', sub: '施術で血流を整えると\n有酸素運動の脂肪燃焼効果が更にアップします' },
  { eyebrow: '🌿 爽やかな朝に', headline: '体を動かした喜びを\nずっと続けるために', sub: 'ウォーキング後のケアで疲労を翌日に残さず\n毎日気持ちよく運動が続けられます' },
  { eyebrow: '🦋 朝のウォーカーさんへ', headline: '歩く習慣が\nある方こそ定期ケアを', sub: '関節・筋肉を定期的に整えることで\n怪我なく健康的に歩き続けられます' },
  { eyebrow: '🌻 今日も早起きですね', headline: '朝の体の動きが\n悪いと感じていませんか？', sub: '起き上がりの辛さ・こわばりは\n整骨院で驚くほど改善できます' },
];

const FALLBACK_SHOPPER = [
  { eyebrow: '🛒 お買い物帰りに', headline: '重い荷物で\n肩がパンパンに', sub: '買い物袋の重さで肩・腰に想像以上の負担\nそのまま帰る前に立ち寄りませんか？' },
  { eyebrow: '🛍️ コープ帰りのあなたへ', headline: '毎週の買い物で\n腰が悲鳴を上げていませんか？', sub: '重い荷物を運び続けることで\n腰への蓄積ダメージは計り知れません' },
  { eyebrow: '🧺 買い物後の肩の重さ', headline: 'ちょっと寄って\nいきませんか？', sub: '10分のご相談でも大歓迎\n体の気になること何でもお聞きします' },
  { eyebrow: '🥕 今日のお買い物ついでに', headline: '主婦の体こそ\n定期メンテナンスを', sub: '家事・買い物・育児で酷使する体\nプロの手で整えましょう' },
  { eyebrow: '🍱 お買い物後のひと休みに', headline: '肩・腰の疲れを\nリセットしませんか？', sub: '短時間の施術でもスッキリ変わります\nお気軽にお立ち寄りください' },
  { eyebrow: '🌸 お買い物のついでに', headline: '健康への投資が\n一番お得な買い物', sub: 'サクラ整骨院のサブスクなら\n月7,800円で通い放題です' },
  { eyebrow: '🛒 重い荷物のあとに', headline: '腕・肩・腰を\n一度リセットしませんか', sub: '施術後は体が軽くなり\n帰り道が楽になります' },
  { eyebrow: '🏪 近くまで来たついでに', headline: '体の気になることを\n気軽に相談できます', sub: '予約なしでも対応できる場合があります\nまずはお声がけください' },
];

const FALLBACK_KIDS = [
  { eyebrow: '🎒 学校帰りのご家族へ', headline: 'ランドセルで\n子どもの姿勢が心配', sub: '小学生の3人に1人が姿勢の問題を抱えています\n成長期の早期ケアが将来を変えます' },
  { eyebrow: '👦 お子さまの体のこと', headline: 'ゲーム・スマホで\n子どもの首が心配', sub: '成長期の歪みは早めに対処することが\n将来の健康につながります' },
  { eyebrow: '🏫 放課後の時間に', headline: 'お子さまと一緒に\n体のチェックを', sub: '子どもも大人も一緒に来院OK\n家族で健康を管理しましょう' },
  { eyebrow: '⚽ スポーツをするお子さまへ', headline: '練習後のケアが\n成長の差を生む', sub: '子どものスポーツ障害は放置すると深刻に\n早めの相談がおすすめです' },
  { eyebrow: '🎵 習い事帰りのお子さまへ', headline: '体の成長に合わせた\nケアをしていますか？', sub: '音楽・バレエ・武道…続けるほど体への負担も増えます\n成長期のケアが大人になってから差が出ます' },
  { eyebrow: '📚 受験生のいるご家庭へ', headline: '長時間の勉強が\n姿勢を崩しています', sub: '勉強姿勢の悪さが集中力も下げます\n整骨院で姿勢を整えると成績アップにも！' },
  { eyebrow: '🏃 スポーツ少年団のご父兄へ', headline: '子どもの体の痛みを\n見逃していませんか？', sub: '子どもは痛みを我慢しがちです\n気になる様子があれば早めにご相談を' },
  { eyebrow: '🌟 元気なお子さまの未来のために', headline: '成長期の姿勢ケアが\n一生の財産になります', sub: '正しい姿勢を身につけた子どもは\n大人になってからも健康でいられます' },
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

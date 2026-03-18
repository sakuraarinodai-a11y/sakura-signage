import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron Job から毎日 0:00 JST (15:00 UTC) に呼ばれる
// Authorization: Bearer {CRON_SECRET} ヘッダーで保護
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // daily-content キャッシュを無効化 → 次回アクセス時に Gemini で再生成
  revalidatePath('/api/daily-content');
  revalidatePath('/');

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: 'Daily content cache revalidated',
  });
}

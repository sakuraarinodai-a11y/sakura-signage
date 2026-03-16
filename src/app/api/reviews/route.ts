import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1時間キャッシュ

interface GoogleReview {
  text: string;
  rating: number;
  author_name: string;
  relative_time_description: string;
  profile_photo_url: string;
}

export async function GET() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // APIキー未設定の場合はフォールバックデータを返す
  if (!placeId || !apiKey) {
    return NextResponse.json({ reviews: [], configured: false });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&language=ja&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('Places API error:', data.status);
      return NextResponse.json({ reviews: [], configured: true, error: data.status });
    }

    const reviews: GoogleReview[] = data.result?.reviews ?? [];
    const rating: number = data.result?.rating ?? 0;
    const total: number = data.result?.user_ratings_total ?? 0;

    // 星4以上の口コミのみ取得・テキストがあるものだけ
    // 投稿者名は匿名化（名前の頭文字のみ残す）
    const anonymize = (name: string) => {
      if (!name || name.length === 0) return 'Googleユーザー';
      return name.charAt(0) + '様';
    };

    const filtered = reviews
      .filter(r => r.rating >= 4 && r.text && r.text.length > 10)
      .map(r => ({
        text: r.text.slice(0, 120),
        rating: r.rating,
        author: anonymize(r.author_name), // 匿名化
        time: r.relative_time_description,
      }));

    return NextResponse.json({
      reviews: filtered,
      rating,
      total,
      configured: true,
    });
  } catch (err) {
    console.error('Reviews fetch error:', err);
    return NextResponse.json({ reviews: [], configured: true, error: 'fetch_failed' });
  }
}

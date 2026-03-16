import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'サクラ整骨院 デジタルサイネージ',
  description: '神戸市北区 サクラ整骨院',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000', fontFamily: '"Noto Sans JP", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}

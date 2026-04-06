import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'MediaGrab — YouTube & Instagram Downloader',
  description:
    'Convert and download YouTube videos and Instagram reels to MP3 or MP4 in multiple quality options. Fast, free, and easy.',
  keywords: ['youtube downloader', 'instagram downloader', 'mp3 converter', 'mp4 converter'],
  openGraph: {
    title: 'MediaGrab — YouTube & Instagram Downloader',
    description: 'Download YouTube & Instagram media in MP3 / MP4',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A22',
              color: '#e2e8f0',
              border: '1px solid #2D2D3D',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}

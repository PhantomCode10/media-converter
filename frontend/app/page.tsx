'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Shield, Zap, Clock } from 'lucide-react';
import Header from '@/components/Header';
import DownloaderSection from '@/components/DownloaderSection';
import HistoryPanel from '@/components/HistoryPanel';
import { useHistory } from '@/hooks/useHistory';
import type { ConvertResult, Platform } from '@/types';

const FEATURES = [
  { icon: Zap, label: 'Fast Conversion', desc: 'Powered by yt-dlp & FFmpeg' },
  { icon: Shield, label: 'No Registration', desc: 'No account needed, ever' },
  { icon: Clock, label: 'Auto Cleanup', desc: 'Files deleted after 1 hour' },
];

export default function HomePage() {
  const { history, addToHistory, clearHistory } = useHistory();

  const handleConverted = useCallback(
    (result: ConvertResult | null, platform: Platform) => {
      if (result) addToHistory(result, platform);
    },
    [addToHistory]
  );

  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-yt/5 blur-[120px]" />
        <div className="absolute -top-20 right-1/4 h-96 w-96 rounded-full bg-ig-purple/5 blur-[120px]" />
      </div>

      <Header />

      <main className="relative mx-auto max-w-5xl px-4 py-10">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Download{' '}
            <span className="text-yt-gradient">YouTube</span>
            {' & '}
            <span className="text-ig-gradient">Instagram</span>
            {' '}Media
          </h1>
          <p className="mx-auto max-w-xl text-balance text-base text-slate-400">
            Convert videos and audio to MP3 or MP4 in multiple quality levels — free, fast, and
            no sign-up required.
          </p>

          {/* Feature pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-surface-border bg-surface-card px-3.5 py-1.5 text-xs text-slate-400"
              >
                <Icon className="h-3.5 w-3.5 text-slate-300" />
                <span className="font-medium text-slate-200">{label}</span>
                <span className="hidden sm:inline">— {desc}</span>
              </div>
            ))}
          </div>

          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="mt-6 flex justify-center"
          >
            <ArrowDown className="h-5 w-5 text-slate-600" />
          </motion.div>
        </motion.div>

        {/* Downloader grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            id="youtube"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DownloaderSection
              platform="youtube"
              onConverted={handleConverted}
            />
          </motion.div>

          <motion.div
            id="instagram"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DownloaderSection
              platform="instagram"
              onConverted={handleConverted}
            />
          </motion.div>
        </div>

        {/* Download history */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <HistoryPanel history={history} onClear={clearHistory} />
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 border-t border-surface-border pt-6 text-center text-xs text-slate-600">
          <p>
            MediaGrab is for personal use only. Respect copyright and platform terms of service.
            Files are automatically deleted from our servers after 1 hour.
          </p>
          <p className="mt-1">Built with Next.js, Express, yt-dlp &amp; FFmpeg.</p>
        </footer>
      </main>
    </div>
  );
}

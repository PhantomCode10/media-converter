'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Download, Music, Video, ChevronDown, Loader2, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { useDownload } from '@/hooks/useDownload';
import DownloadResult from './DownloadResult';
import type { Platform, MediaFormat } from '@/types';

// ─── Quality options per platform & format ──────────────────────────────────

const QUALITY_OPTIONS: Record<Platform, Record<MediaFormat, { label: string; value: string }[]>> = {
  youtube: {
    mp4: [
      { label: '144p (Low)', value: '144p' },
      { label: '360p (SD)', value: '360p' },
      { label: '720p (HD)', value: '720p' },
      { label: '1080p (Full HD)', value: '1080p' },
    ],
    mp3: [
      { label: '128 kbps (Standard)', value: '128kbps' },
      { label: '320 kbps (High Quality)', value: '320kbps' },
    ],
  },
  instagram: {
    mp4: [
      { label: 'Medium Quality', value: 'medium' },
      { label: 'Best Available', value: 'best' },
    ],
    mp3: [
      { label: '128 kbps (Standard)', value: '128kbps' },
      { label: '320 kbps (High Quality)', value: '320kbps' },
    ],
  },
};

// ─── Accent colours per platform ────────────────────────────────────────────

const ACCENT: Record<Platform, { ring: string; btn: string; icon: string; border: string }> = {
  youtube: {
    ring: 'focus:ring-yt/50',
    btn: 'bg-yt hover:bg-yt-dark',
    icon: 'text-yt',
    border: 'border-yt/30',
  },
  instagram: {
    ring: 'focus:ring-ig-pink/50',
    btn: 'bg-ig-gradient hover:opacity-90',
    icon: 'text-ig-pink',
    border: 'border-ig-pink/30',
  },
};

interface Props {
  platform: Platform;
  onConverted?: (result: ReturnType<typeof useDownload>['result'], platform: Platform) => void;
}

export default function DownloaderSection({ platform, onConverted }: Props) {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<MediaFormat>('mp4');
  const [quality, setQuality] = useState<string>(
    QUALITY_OPTIONS[platform].mp4[platform === 'youtube' ? 2 : 1].value
  );

  const { status, result, error, convert, reset } = useDownload(platform);
  const accent = ACCENT[platform];
  const qualityOptions = QUALITY_OPTIONS[platform][format];

  // When format changes, reset quality to first option for that format
  function handleFormatChange(f: MediaFormat) {
    setFormat(f);
    setQuality(QUALITY_OPTIONS[platform][f][0].value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await convert({ url: url.trim(), format, quality });
    if (res && onConverted) onConverted(res, platform);
  }

  function handleReset() {
    reset();
    setUrl('');
  }

  const isLoading = status === 'loading';

  return (
    <section className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-xl">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-hover', accent.icon)}>
          {platform === 'youtube' ? (
            /* YouTube play icon */
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.45 20.5 12 20.5 12 20.5s7.55 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
            </svg>
          ) : (
            /* Instagram icon */
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {platform === 'youtube' ? 'YouTube Downloader' : 'Instagram Downloader'}
          </h2>
          <p className="text-sm text-slate-400">
            {platform === 'youtube'
              ? 'Videos, Shorts & Music — MP3 / MP4'
              : 'Posts, Reels & Videos — MP3 / MP4'}
          </p>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        {status === 'success' && result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DownloadResult result={result} />
            <button
              onClick={handleReset}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-surface-hover hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Convert another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* URL Input */}
            <div className="relative">
              <Link className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  platform === 'youtube'
                    ? 'https://youtube.com/watch?v=...'
                    : 'https://www.instagram.com/p/...'
                }
                required
                disabled={isLoading}
                className={clsx(
                  'w-full rounded-xl border bg-surface-DEFAULT py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition',
                  'focus:ring-2',
                  accent.border,
                  accent.ring,
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              />
            </div>

            {/* Format & Quality row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Format selector */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Format</label>
                <div className="flex rounded-xl border border-surface-border bg-surface-DEFAULT p-1">
                  {(['mp4', 'mp3'] as MediaFormat[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleFormatChange(f)}
                      disabled={isLoading}
                      className={clsx(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
                        format === f
                          ? 'bg-surface-hover text-white shadow'
                          : 'text-slate-500 hover:text-white'
                      )}
                    >
                      {f === 'mp4' ? <Video className="h-3 w-3" /> : <Music className="h-3 w-3" />}
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality selector */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Quality</label>
                <div className="relative">
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    disabled={isLoading}
                    className={clsx(
                      'w-full appearance-none rounded-xl border bg-surface-DEFAULT px-3 py-2.5 pr-8 text-sm text-white outline-none transition',
                      'focus:ring-2',
                      accent.border,
                      accent.ring,
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    {qualityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading || !url.trim()}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all',
                isLoading && 'cursor-not-allowed opacity-70',
                !isLoading && accent.btn
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing… This may take a minute
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Convert &amp; Download
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Download, Trash2, FileAudio, FileVideo, Youtube } from 'lucide-react';
import clsx from 'clsx';
import type { DownloadHistoryItem } from '@/types';
import { formatBytes } from '@/lib/api';

interface Props {
  history: DownloadHistoryItem[];
  onClear: () => void;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function HistoryPanel({ history, onClear }: Props) {
  if (history.length === 0) {
    return (
      <section
        id="history"
        className="mt-6 rounded-2xl border border-surface-border bg-surface-card p-6 text-center"
      >
        <Clock className="mx-auto mb-2 h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">Your download history will appear here.</p>
      </section>
    );
  }

  return (
    <section id="history" className="mt-6 rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Clock className="h-4 w-4 text-slate-400" />
          Recent Downloads
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-surface-hover hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {history.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-DEFAULT px-3 py-2.5"
            >
              {/* Platform / format icon */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                {item.format === 'mp3' ? (
                  <FileAudio className="h-4 w-4 text-emerald-400" />
                ) : item.platform === 'youtube' ? (
                  <Youtube className="h-4 w-4 text-yt" />
                ) : (
                  <FileVideo className="h-4 w-4 text-ig-pink" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white" title={item.title}>
                  {item.title || item.filename}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span className="uppercase">{item.format}</span>
                  <span>·</span>
                  <span>{item.quality}</span>
                  <span>·</span>
                  <span>{formatBytes(item.size)}</span>
                  <span>·</span>
                  <span>{timeAgo(item.convertedAt)}</span>
                </div>
              </div>

              {/* Re-download button */}
              <a
                href={item.downloadUrl}
                download={item.filename}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-slate-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400"
                title="Download again"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

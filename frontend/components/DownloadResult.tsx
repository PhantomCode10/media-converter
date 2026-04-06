'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Check, FileAudio, FileVideo, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import type { ConvertResult } from '@/types';
import { formatBytes } from '@/lib/api';

interface Props {
  result: ConvertResult;
}

export default function DownloadResult({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const isAudio = result.format === 'mp3';

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-xl border border-emerald-500/25 bg-emerald-500/5"
    >
      {/* Thumbnail + meta row */}
      <div className="flex items-start gap-4 p-4">
        {result.thumbnail ? (
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-hover">
            <Image
              src={result.thumbnail}
              alt={result.title || 'thumbnail'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-surface-hover">
            {isAudio ? (
              <FileAudio className="h-7 w-7 text-emerald-400" />
            ) : (
              <FileVideo className="h-7 w-7 text-emerald-400" />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white" title={result.title}>
            {result.title || result.filename}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="rounded-md bg-surface-hover px-2 py-0.5 font-mono uppercase tracking-wide">
              {result.format}
            </span>
            <span>{result.quality}</span>
            <span>{formatBytes(result.size)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-px border-t border-surface-border bg-surface-border">
        {/* Download */}
        <a
          href={result.downloadUrl}
          download={result.filename}
          className={clsx(
            'flex items-center justify-center gap-2 bg-surface-card px-4 py-3 text-sm font-semibold text-emerald-400',
            'transition-colors hover:bg-surface-hover hover:text-emerald-300'
          )}
        >
          <Download className="h-4 w-4" />
          Download
        </a>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className={clsx(
            'flex items-center justify-center gap-2 bg-surface-card px-4 py-3 text-sm font-medium text-slate-400',
            'transition-colors hover:bg-surface-hover hover:text-white'
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Expiry note */}
      <p className="px-4 py-2 text-center text-xs text-slate-500">
        Link expires in 1 hour • Files are automatically deleted
      </p>
    </motion.div>
  );
}

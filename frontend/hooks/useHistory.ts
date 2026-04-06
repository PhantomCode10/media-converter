'use client';
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DownloadHistoryItem, ConvertResult, Platform } from '@/types';

const STORAGE_KEY = 'mc_download_history';
const MAX_HISTORY = 20;

function loadHistory(): DownloadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DownloadHistoryItem[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: DownloadHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    // localStorage unavailable (e.g. private browsing with storage disabled)
  }
}

export function useHistory() {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addToHistory = useCallback((result: ConvertResult, platform: Platform) => {
    setHistory((prev) => {
      const item: DownloadHistoryItem = {
        ...result,
        id: uuidv4(),
        platform,
        convertedAt: Date.now(),
      };
      const next = [item, ...prev].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { history, addToHistory, clearHistory };
}

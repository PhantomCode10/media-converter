'use client';
import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Platform, ConvertRequest, ConvertResult, ConvertStatus } from '@/types';
import { convertYoutube, convertInstagram } from '@/lib/api';

export function useDownload(platform: Platform) {
  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(
    async (data: ConvertRequest) => {
      setStatus('loading');
      setError(null);
      setResult(null);
      try {
        const res =
          platform === 'youtube'
            ? await convertYoutube(data)
            : await convertInstagram(data);
        setResult(res);
        setStatus('success');
        return res;
      } catch (err: unknown) {
        let message = 'An unexpected error occurred. Please try again.';
        if (axios.isAxiosError(err)) {
          message =
            err.response?.data?.error ||
            err.message ||
            message;
        }
        setError(message);
        setStatus('error');
        return null;
      }
    },
    [platform]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, convert, reset };
}

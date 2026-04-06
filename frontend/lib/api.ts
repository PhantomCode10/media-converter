import axios from 'axios';
import type { ConvertRequest, ConvertResult } from '@/types';

// In development, Next.js rewrites /api/* to the backend (next.config.js).
// In production Vercel deployment, this should point to the deployed backend.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300_000, // 5 min — media downloads can be slow
  headers: { 'Content-Type': 'application/json' },
});

export async function convertYoutube(data: ConvertRequest): Promise<ConvertResult> {
  const response = await api.post<ConvertResult>('/api/youtube/convert', data);
  return response.data;
}

export async function convertInstagram(data: ConvertRequest): Promise<ConvertResult> {
  const response = await api.post<ConvertResult>('/api/instagram/convert', data);
  return response.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/api/health');
    return true;
  } catch {
    return false;
  }
}

/** Format bytes into a human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

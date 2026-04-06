// Shared type definitions for the media converter app

export type Platform = 'youtube' | 'instagram';
export type MediaFormat = 'mp3' | 'mp4';

export type YoutubeQuality =
  | '144p'
  | '360p'
  | '720p'
  | '1080p'
  | '128kbps'
  | '320kbps';

export type InstagramQuality = 'best' | 'medium' | '128kbps' | '320kbps';

export interface ConvertRequest {
  url: string;
  format: MediaFormat;
  quality: string;
}

export interface ConvertResult {
  success: boolean;
  fileId: string;
  title: string;
  thumbnail: string | null;
  filename: string;
  format: MediaFormat;
  quality: string;
  size: number; // bytes
  downloadUrl: string;
}

export interface DownloadHistoryItem extends ConvertResult {
  id: string; // local UUID
  platform: Platform;
  convertedAt: number; // Unix ms timestamp
}

export type ConvertStatus = 'idle' | 'loading' | 'success' | 'error';

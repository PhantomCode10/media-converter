# MediaGrab — YouTube & Instagram Downloader

A production-ready full-stack media converter that downloads YouTube videos/Shorts and Instagram posts/reels in MP3 or MP4 format with multiple quality options.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js 20, Express 4, JavaScript |
| Media | yt-dlp (auto-downloaded), FFmpeg |
| Deployment | Frontend → Vercel, Backend → Railway / Render / Docker |

---

## Project Structure

```
media-converter/
├── frontend/                     # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx            # Root layout + metadata
│   │   ├── page.tsx              # Homepage
│   │   └── globals.css           # Global styles + Tailwind
│   ├── components/
│   │   ├── Header.tsx            # Nav bar + theme toggle
│   │   ├── DownloaderSection.tsx # YouTube & Instagram downloader UI
│   │   ├── DownloadResult.tsx    # File card with download + copy buttons
│   │   └── HistoryPanel.tsx      # Session download history
│   ├── hooks/
│   │   ├── useDownload.ts        # Conversion state machine
│   │   ├── useHistory.ts         # localStorage history
│   │   └── useTheme.ts           # Dark/light toggle
│   ├── lib/
│   │   └── api.ts                # Axios API client + helpers
│   └── types/
│       └── index.ts              # Shared TypeScript types
│
├── backend/                      # Express API
│   └── src/
│       ├── index.js              # Server bootstrap, middleware, cron
│       ├── routes/
│       │   ├── youtube.js        # GET /info, POST /convert
│       │   └── instagram.js      # GET /info, POST /convert
│       ├── controllers/
│       │   ├── youtubeController.js
│       │   └── instagramController.js
│       ├── services/
│       │   ├── youtubeService.js # yt-dlp wrapper for YouTube
│       │   └── instagramService.js # yt-dlp wrapper for Instagram
│       ├── middleware/
│       │   ├── rateLimiter.js    # Global + per-route rate limits
│       │   └── errorHandler.js   # Centralised error → HTTP response
│       └── utils/
│           ├── validator.js      # URL regex validators
│           ├── fileManager.js    # TTL registry + cleanup cron
│           └── logger.js         # Winston logger
│
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | 18+ | 20 LTS recommended |
| npm | 8+ | Bundled with Node |
| FFmpeg | Any recent | Must be in system PATH |
| yt-dlp | Any | Auto-downloaded to `backend/bin/` if missing |

### Install FFmpeg

**Windows:**
```powershell
# Via winget
winget install Gyan.FFmpeg

# Or download from https://ffmpeg.org/download.html
# and add the bin/ folder to your PATH
```

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
```

---

## Local Development Setup

### 1. Clone & install

```bash
git clone <your-repo-url>
cd media-converter
```

### 2. Backend

```bash
cd backend
npm install

# Copy env file and edit as needed
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
FILE_TTL_MINUTES=60
```

Start the backend dev server:
```bash
npm run dev
# → Listening on http://localhost:5000
```

On first conversion request, **yt-dlp** is automatically downloaded to `backend/bin/`.

### 3. Frontend

Open a new terminal:
```bash
cd frontend
npm install

# Copy env file
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend dev server:
```bash
npm run dev
# → Open http://localhost:3000
```

---

## API Reference

### Health Check
```
GET /api/health
→ { "status": "ok", "timestamp": "..." }
```

### YouTube

```
GET  /api/youtube/info?url=<youtubeUrl>
POST /api/youtube/convert
     Body: { url, format: "mp3"|"mp4", quality: "128kbps"|"320kbps"|"144p"|"360p"|"720p"|"1080p" }
```

### Instagram

```
GET  /api/instagram/info?url=<instagramUrl>
POST /api/instagram/convert
     Body: { url, format: "mp3"|"mp4", quality: "128kbps"|"320kbps"|"medium"|"best" }
```

### Download file

```
GET /api/download/:fileId
```

All convert endpoints return:
```json
{
  "success": true,
  "fileId": "uuid",
  "title": "Video Title",
  "thumbnail": "https://...",
  "filename": "Video_Title.mp4",
  "format": "mp4",
  "quality": "720p",
  "size": 12345678,
  "downloadUrl": "http://localhost:5000/api/download/uuid"
}
```

---

## Rate Limits

| Scope | Limit | Window |
|---|---|---|
| All routes (global) | 100 requests | 15 minutes |
| `/convert` endpoints | 10 requests | 15 minutes |

Limits are per IP address. Configurable via environment variables.

---

## Deployment

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo (or the whole monorepo)
2. Connect the repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.up.railway.app
   ```
5. Deploy ✓

### Backend → Railway

1. Push `backend/` to GitHub
2. Create a new project on [railway.app](https://railway.app)
3. Connect your repo, set **Root Directory** to `backend`
4. Add environment variables (see `.env.example`)
5. Railway auto-detects Node.js and runs `npm start`

> **Note:** Railway's free tier works but for consistent availability use a paid plan or Render.

### Backend → Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your repo, set root to `backend/`
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add environment variables from `.env.example`

### Docker (self-hosted / VPS)

```bash
# From project root
docker compose up -d

# View logs
docker compose logs -f backend

# Stop
docker compose down
```

The compose file binds:
- Frontend → `localhost:3000`
- Backend  → `localhost:5000`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | HTTP port |
| `NODE_ENV` | `development` | Environment mode |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |
| `DOWNLOADS_DIR` | `./downloads` | Where temp files are stored |
| `FILE_TTL_MINUTES` | `60` | Minutes before file auto-delete |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window in ms (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window (global) |
| `CONVERT_RATE_LIMIT_MAX` | `10` | Max convert requests per window |
| `YTDLP_BINARY_PATH` | *(auto)* | Path to yt-dlp binary |
| `YTDLP_VERBOSE` | `false` | Enable verbose yt-dlp output |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Backend base URL |

---

## Features

- **YouTube**: Videos, Shorts, Music — MP3 (128 / 320 kbps) and MP4 (144p → 1080p)
- **Instagram**: Public posts and reels — MP3 and MP4 (medium / best quality)
- **Dark / Light mode** toggle persisted to localStorage
- **Download history** — last 20 downloads, persisted to localStorage
- **Copy link** button for each conversion result
- **File size** display after conversion
- **Auto-cleanup** — files deleted after TTL (default 1 hour)
- **Rate limiting** — global + per-route IP-based throttling
- **User-friendly errors** — private/restricted content, network errors, invalid URLs
- **Responsive** — mobile-first design

## Known Limitations

- **Instagram private content**: Cannot be downloaded (requires authentication)
- **Instagram Stories**: Expire quickly and are harder to scrape reliably
- **YouTube age-restricted videos**: May require cookies — see yt-dlp docs
- **Concurrent conversions**: No job queue; long videos may timeout on free-tier hosts. For high traffic, add BullMQ + Redis.

## Security Notes

- All downloads are identified by UUIDs (no path traversal possible)
- Input URLs are validated by regex before processing
- Helmet sets security headers
- CORS whitelist enforced
- Rate limiting prevents abuse
- Files automatically deleted from server

## License

MIT — for personal / educational use. Respect the terms of service of YouTube and Instagram.

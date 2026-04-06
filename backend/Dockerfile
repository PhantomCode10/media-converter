FROM node:20-slim

# Install system dependencies: ffmpeg (required for audio/video processing)
# and ca-certificates for HTTPS requests
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY src/ ./src/

# Create downloads directory with appropriate permissions
RUN mkdir -p /app/downloads && chmod 755 /app/downloads

# Create bin directory for yt-dlp
RUN mkdir -p /app/bin

# yt-dlp binary will be auto-downloaded on first run if YTDLP_BINARY_PATH is not set
# Alternatively, pre-download to speed up cold starts:
# RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /app/bin/yt-dlp \
#     && chmod +x /app/bin/yt-dlp

# Set environment
ENV NODE_ENV=production \
    PORT=5000 \
    DOWNLOADS_DIR=/app/downloads

EXPOSE 5000

# Run as non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app
USER appuser

CMD ["node", "src/index.js"]

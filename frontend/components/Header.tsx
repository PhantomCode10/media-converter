'use client';
import { Moon, Sun, Youtube, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export default function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface-DEFAULT/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yt to-ig-purple">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white dark:text-white">
            Media<span className="text-yt">Grab</span>
          </span>
        </motion.div>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 sm:flex">
          <a href="#youtube" className="transition-colors hover:text-white">YouTube</a>
          <a href="#instagram" className="transition-colors hover:text-white">Instagram</a>
          <a href="#history" className="transition-colors hover:text-white">History</a>
        </nav>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-card text-slate-400 transition-colors hover:bg-surface-hover hover:text-white"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>
      </div>
    </header>
  );
}

'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ background: 'var(--bg-base)' }}>
      <div className="mesh-gradient" />
      <div className="grid-overlay" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="text-8xl font-display font-bold mb-4 gradient-text">404</div>
        <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--ink-primary)' }}>Page not found</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-tertiary)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary px-6 py-3 rounded-2xl text-sm font-semibold text-white">
            ← Back to Dashboard
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}

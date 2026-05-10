'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useStore(s => s.isAuthenticated)
  useEffect(() => {
    router.push(isAuthenticated ? '/dashboard' : '/auth')
  }, [isAuthenticated, router])
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )
}

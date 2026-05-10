import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'TaskFlow — Team OS',
  description: 'The modern task manager for high-performing teams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#161B24',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#F0F6FF',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            borderRadius: '10px',
          }
        }} />
      </body>
    </html>
  )
}

'use client'
import { useEffect } from 'react'
import { AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="zh">
      <body className="bg-[#0a0a0f] text-[#f1f5f9]">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">出错了</h2>
            <p className="text-[#94a3b8] mb-6">
              抱歉，应用程序遇到了一些问题。
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-md text-sm font-medium bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white hover:opacity-90 transition-opacity"
              >
                重试
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-md text-sm font-medium border border-[#1e1e2e] text-[#94a3b8] hover:text-white hover:border-[#3b82f6] transition-colors inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

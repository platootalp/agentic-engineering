import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: '游戏市场分析 Agent',
  description: 'AI 驱动的独立游戏市场分析工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <html lang="zh" suppressHydrationWarning>
        <body className="min-h-screen bg-bg antialiased">{children}</body>
      </html>
    </ThemeProvider>
  )
}

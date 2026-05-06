'use client'

import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="fixed top-0 right-0 z-50 p-4" style={{ left: 'var(--sidebar-width, 16rem)' }}>
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
    </header>
  )
}

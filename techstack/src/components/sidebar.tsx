'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Home, Code2, Server, Bot, Network, Layers, PanelLeft, PanelRight, Database } from 'lucide-react'

const routes = [
  {
    label: '首页',
    icon: Home,
    href: '/',
    color: 'text-sky-500',
  },
  {
    label: '技术全景',
    icon: Layers,
    href: '/tech-stack',
    color: 'text-amber-500',
  },
  {
    label: '前端技术',
    icon: Code2,
    href: '/frontend',
    color: 'text-pink-500',
  },
  {
    label: '后端技术',
    icon: Server,
    href: '/backend',
    color: 'text-green-500',
  },
  {
    label: 'AI 开发',
    icon: Bot,
    href: '/ai-stack',
    color: 'text-purple-500',
  },
  {
    label: '基础设施',
    icon: Network,
    href: '/infrastructure',
    color: 'text-blue-500',
  },
  {
    label: '存储技术',
    icon: Database,
    href: '/storage',
    color: 'text-orange-500',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setCollapsed(saved === 'true')
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '4rem' : '16rem')
  }, [collapsed])

  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white fixed left-0 top-0 transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/"
          className={cn(
            'overflow-hidden transition-all duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">
            技术栈全景图
          </h1>
        </Link>
        <button
          onClick={toggleCollapsed}
          className={cn(
            'p-1.5 rounded-md text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors',
            collapsed && 'mx-auto'
          )}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group',
                pathname === route.href
                  ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10',
                collapsed && 'justify-center px-2'
              )}
            >
              <route.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  route.color,
                  !collapsed && 'mr-3'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium whitespace-nowrap transition-all duration-300',
                  collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                )}
              >
                {route.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <div
          className={cn(
            'text-xs text-gray-500 dark:text-zinc-500 transition-all duration-300',
            collapsed && 'text-center'
          )}
        >
          {collapsed ? (
            <span>©25</span>
          ) : (
            <>
              <p>© 2025 TechStack Panorama</p>
              <p className="mt-1">Powered by Next.js</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

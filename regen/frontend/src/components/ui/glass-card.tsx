import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'primary' | 'accent' | 'none'
  onClick?: () => void
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = 'none',
  onClick,
}: GlassCardProps) {
  const glowStyles = {
    primary: 'hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]',
    accent: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]',
    none: '',
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl bg-white/80 backdrop-blur-md border border-white/40',
        'shadow-lg shadow-black/5',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:bg-white/90',
        glowStyles[glow],
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

export function GlassContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-white/60 backdrop-blur-xl border border-white/30',
        'shadow-xl shadow-black/5',
        className
      )}
    >
      {children}
    </div>
  )
}

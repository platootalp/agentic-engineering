import { motion } from 'framer-motion'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GradientButtonProps {
  children: ReactNode
  variant?: 'primary' | 'accent' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function GradientButton({
  children,
  variant = 'primary',
  size = 'default',
  className,
  onClick,
  disabled,
  type = 'button',
}: GradientButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/30',
    accent: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/30',
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        type={type}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'font-semibold transition-all duration-200 cursor-pointer',
          variants[variant],
          className
        )}
      >
        {children}
      </Button>
    </motion.div>
  )
}

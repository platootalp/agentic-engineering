'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        rounded-xl border border-border bg-card
        py-16 px-6
        animate-in fade-in slide-in-from-bottom-4 duration-500
        ${className}
      `}
    >
      <div
        className="
          mb-6 flex h-20 w-20 items-center justify-center
          rounded-2xl bg-muted
          ring-1 ring-border
          transition-transform duration-300
          hover:scale-105
        "
      >
        <div className="text-muted-foreground">{icon}</div>
      </div>

      <h3 className="mb-2 text-xl font-semibold text-foreground text-center">
        {title}
      </h3>

      <p className="mb-6 max-w-md text-center text-muted-foreground leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="
            bg-primary hover:bg-primary/90
            text-primary-foreground font-semibold
            px-6 py-3
            rounded-lg
            transition-all duration-200
            hover:shadow-lg hover:shadow-primary/25
            hover:-translate-y-0.5
          "
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

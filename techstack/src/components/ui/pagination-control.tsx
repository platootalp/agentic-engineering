'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PaginationControlProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  pageSizeOptions: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  className?: string
}

export function PaginationControl({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationControlProps) {
  if (totalItems === 0) {
    return null
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4',
      'bg-white/50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10',
      'backdrop-blur-sm',
      className
    )}>
      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-medium">每页显示</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-20 h-9 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
            {pageSizeOptions.map((size) => (
              <SelectItem 
                key={size} 
                value={size.toString()}
                className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-500/20"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-medium">条</span>
        <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
          · 共 {totalItems} 条
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-2">
          <span className="text-purple-600 dark:text-purple-400">{startItem}-{endItem}</span>
          <span className="text-slate-400 dark:text-slate-500 mx-1">/</span>
          <span className="text-slate-500 dark:text-slate-500">{totalItems}</span>
        </span>
        
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl border-slate-200 dark:border-white/10",
              "bg-white/80 dark:bg-white/5",
              "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500",
              "hover:text-white hover:border-transparent",
              "dark:hover:from-blue-600 dark:hover:to-purple-600",
              "transition-all duration-300 ease-out",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:text-slate-600"
            )}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl border-slate-200 dark:border-white/10",
              "bg-white/80 dark:bg-white/5",
              "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500",
              "hover:text-white hover:border-transparent",
              "dark:hover:from-blue-600 dark:hover:to-purple-600",
              "transition-all duration-300 ease-out",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:text-slate-600"
            )}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span 
                  key={`ellipsis-${index}`} 
                  className="px-2 text-slate-400 dark:text-slate-500 text-sm font-medium"
                >
                  ···
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-xl text-sm font-semibold transition-all duration-300 ease-out",
                    currentPage === page
                      ? cn(
                          "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
                          "text-white border-transparent",
                          "shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20",
                          "hover:from-blue-600 hover:via-purple-600 hover:to-pink-600",
                          "hover:shadow-xl hover:shadow-purple-500/30"
                        )
                      : cn(
                          "border-slate-200 dark:border-white/10",
                          "bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-400",
                          "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500",
                          "hover:text-white hover:border-transparent",
                          "dark:hover:from-blue-600 dark:hover:to-purple-600"
                        )
                  )}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl border-slate-200 dark:border-white/10",
              "bg-white/80 dark:bg-white/5",
              "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500",
              "hover:text-white hover:border-transparent",
              "dark:hover:from-blue-600 dark:hover:to-purple-600",
              "transition-all duration-300 ease-out",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:text-slate-600"
            )}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-xl border-slate-200 dark:border-white/10",
              "bg-white/80 dark:bg-white/5",
              "hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500",
              "hover:text-white hover:border-transparent",
              "dark:hover:from-blue-600 dark:hover:to-purple-600",
              "transition-all duration-300 ease-out",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:text-slate-600"
            )}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

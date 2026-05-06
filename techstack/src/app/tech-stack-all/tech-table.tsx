'use client'

import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { usePagination } from '@/hooks/use-pagination'
import { PaginationControl } from '@/components/ui/pagination-control'

interface TechItem {
  category: string
  tech: string
  popular: string
  description: string
}

interface TechTableProps {
  data: TechItem[]
  title: string
  icon?: string
  collapsible?: boolean
}

// 使用 Intersection Observer 实现可视区域加载
function useInView(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // 如果已经加载过，不再观察
    if (isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '100px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, isInView])

  return { ref, isInView }
}

// 表格行组件 - memo化
const TechTableRow = memo(function TechTableRow({ row }: { row: TechItem }) {
  return (
    <tr className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 whitespace-nowrap text-sm">
        {row.category}
      </td>
      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-1">
          {row.tech.split(' / ').slice(0, 6).map((tech, i) => (
            <span 
              key={i} 
              className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-200"
            >
              {tech.trim()}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
        <span className="inline-block px-2.5 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold whitespace-nowrap">
          {row.popular}
        </span>
      </td>
      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 text-xs">
        {row.description}
      </td>
    </tr>
  )
})

// 骨架屏组件
function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded mb-2 w-full"></div>
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded mb-2 w-full"></div>
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
    </div>
  )
}

// 可折叠表格组件
export const TechTable = memo(function TechTable({ data, title, icon, collapsible = false }: TechTableProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  const { ref, isInView } = useInView(0.1)

  const {
    currentData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    pageSizeOptions,
    setPage,
    setPageSize,
  } = usePagination(data, { initialPageSize: 10 })

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  return (
    <div ref={ref} className="mb-6">
      <button 
        onClick={collapsible ? toggleExpand : undefined}
        className={`w-full text-left text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg ${collapsible ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors' : ''}`}
      >
        {icon && <span className="text-xl">{icon}</span>}
        <span className="flex-1">{title}</span>
        {collapsible && (
          <span className="text-gray-500">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </button>
      
      {isExpanded && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            {!isInView ? (
              <TableSkeleton />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 w-28 whitespace-nowrap">
                      分类
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                      主流技术
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 w-36 whitespace-nowrap">
                      热门推荐
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 w-32">
                      说明
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, index) => (
                    <TechTableRow key={index} row={row} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {isInView && (
            <div className="mt-4">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                pageSizeOptions={pageSizeOptions}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
})

// 延迟加载区块组件
export function LazySection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [show, setShow] = useState(false)
  const { ref, isInView } = useInView(0.05)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShow(true), delay)
      return () => clearTimeout(timer)
    }
  }, [isInView, delay])

  return (
    <div ref={ref}>
      {show ? children : <TableSkeleton />}
    </div>
  )
}

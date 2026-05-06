const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1'

// 请求超时设置（毫秒）
const REQUEST_TIMEOUT = 30000 // 30秒普通请求
const STREAM_TIMEOUT = 600000 // 10分钟流式请求

// 简单的内存缓存，用于缓存短期数据
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 30000 // 30秒缓存

function getCacheKey(path: string, options?: RequestInit): string {
  const method = options?.method || 'GET'
  const body = method === 'POST' ? (options?.body || '') : ''
  return `${method}:${path}:${body}`
}

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  const age = Date.now() - cached.timestamp
  if (age > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return cached.data as T
}

function setCachedData(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// 并发请求去重（使用 WeakMap-like pattern for request deduplication）
const pendingRequests = new Map<string, Promise<unknown>>()

// 带超时的fetch
async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === 'AbortError') {
      throw new Error(`请求超时 (${timeout / 1000}秒)`)
    }
    throw error
  }
}

async function request<T>(path: string, options?: RequestInit, useCache = true): Promise<T> {
  const cacheKey = getCacheKey(path, options)

  // 检查缓存
  if (useCache && (!options?.method || options.method === 'GET')) {
    const cached = getCachedData<T>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  // 检查是否有相同的请求正在进行（仅对简单GET请求）
  if (!options?.method || (options.method === 'GET' && !options.body)) {
    const existing = pendingRequests.get(cacheKey)
    if (existing) {
      // Clone the promise chain to avoid type issues
      return existing.then((data) => data as T).catch((err) => {
        throw err
      })
    }
  }

  const promise = fetchWithTimeout(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }).then(async (res) => {
    pendingRequests.delete(cacheKey)

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }

    const data = await res.json()

    // 缓存成功的GET请求
    if (useCache && (!options?.method || options.method === 'GET')) {
      setCachedData(cacheKey, data)
    }

    return data as T
  }).catch((err) => {
    pendingRequests.delete(cacheKey)
    throw err
  })

  // 记录pending请求（仅对简单GET请求，不缓存body）
  if (!options?.method || (options.method === 'GET' && !options.body)) {
    pendingRequests.set(cacheKey, promise)
  }

  return promise
}

// 流式请求（用于SSE）
async function requestStream(
  path: string,
  options?: RequestInit,
  onProgress?: (text: string) => void
): Promise<void> {
  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    ...options,
  }, STREAM_TIMEOUT)

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(err.detail || `HTTP ${response.status}`)
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim()
        if (data && onProgress) {
          onProgress(data)
        }
      }
    }
  }
}

// 清除缓存（用于手动刷新）
export function clearApiCache(): void {
  cache.clear()
  pendingRequests.clear()
}

// 仅清除特定路径的缓存
export function clearApiCachePath(path: string): void {
  for (const key of cache.keys()) {
    if (key.includes(path)) {
      cache.delete(key)
    }
  }
  for (const key of pendingRequests.keys()) {
    if (key.includes(path)) {
      pendingRequests.delete(key)
    }
  }
}

// 导出流式请求函数
export { requestStream }

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataSource = 'exa' | 'appstore' | 'google_play'

export interface Category {
  id: number
  name: string
  slug: string
  keywords: string[]
  data_sources: DataSource[]
  enabled: boolean
  priority: number
  created_at: string
  updated_at: string
}

export type CategoryInput = Pick<Category, 'name' | 'slug' | 'keywords' | 'data_sources' | 'enabled' | 'priority'>

export interface CategoryRanking {
  slug: string
  name?: string
  heat_index: number
  trend: string // e.g. "+12%", "-5%"
}

export interface KPISummary {
  total_reports: number
  latest_report_date: string | null
  categories_tracked: number
  avg_generation_time_seconds: number
}

export interface DashboardSummary {
  kpis: KPISummary
  category_rankings: CategoryRanking[]
  latest_report: {
    id: number
    title: string
    summary: string
    created_at: string
  } | null
  recent_activities: Array<{
    type: string
    message: string
    timestamp: string
  }>
}

export interface TrendPoint {
  date: string
  value: number
}

export interface TopGame {
  name: string
  downloads: string
  change: string
}

export interface TrendsData {
  period: string
  category: string | null
  heat_index_trend: TrendPoint[]
  top_games: TopGame[]
}

export interface Report {
  id: number
  title: string
  summary: string
  full_content: string | null
  insights: Array<{
    type: string
    title: string
    evidence: string[]
    confidence: number
  }>
  sources: string[]
  metrics: {
    category_rankings: CategoryRanking[]
    kpis: Record<string, number>
    heat_index_trend: TrendPoint[]
  } | null
  execution_id: number | null
  status: 'draft' | 'published' | 'archived'
  version: number
  parent_id: number | null
  iteration_depth: number
  created_at: string
}

export interface ReportListItem {
  id: number
  title: string
  summary: string
  status: string
  version: number
  iteration_depth: number
  created_at: string
}

export interface Execution {
  id: number
  report_id: number | null
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  current_step: 'plan' | 'search' | 'analyze' | 'verify' | 'report' | null
  progress: number
  trigger_type: 'scheduled' | 'manual' | 'iteration'
  started_at: string
  estimated_completion: string | null
  completed_at: string | null
  error_message: string | null
  step_results?: Record<string, unknown> | null
}

export interface GenerateResponse {
  execution_id: number
  status: string
  message: string
  poll_url: string
}

// ─── API Client ────────────────────────────────────────────────────────────────

export const api = {
  dashboard: {
    summary: () => request<DashboardSummary>('/dashboard/summary'),
    trends: (params?: { period?: string; category?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return request<TrendsData>(`/dashboard/trends${qs ? `?${qs}` : ''}`)
    },
  },

  reports: {
    list: (params?: { page?: number; category?: string; limit?: number }) => {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k === 'limit' ? 'page_size' : k, String(v)])
        )
      ).toString()
      return request<{ items: ReportListItem[]; total: number; page: number; pages: number }>(
        `/reports${qs ? `?${qs}` : ''}`
      )
    },
    get: (id: string) => request<Report>(`/reports/${id}`),
    generate: (body: { category_slugs?: string[]; force_refresh?: boolean } = {}) =>
      request<GenerateResponse>('/reports/generate', { method: 'POST', body: JSON.stringify(body) }),
    regenerate: (id: string, body: { feedback: string; focus_areas?: string[] }) =>
      request<GenerateResponse>(`/reports/${id}/regenerate`, { method: 'POST', body: JSON.stringify(body) }),
  },

  categories: {
    list: () => request<Category[]>('/categories'),
    create: (body: CategoryInput) =>
      request<Category>('/categories', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<CategoryInput>) =>
      request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) =>
      request<void>(`/categories/${id}`, { method: 'DELETE' }),
    preview: (id: number) =>
      request<{ slug: string; estimated_results: number }>(`/categories/${id}/preview`),
  },

  executions: {
    get: (id: string) => request<Execution>(`/executions/${id}`),
    list: (params?: { limit?: number; offset?: number }) => {
      const qs = new URLSearchParams(
        Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()
      return request<{ items: Execution[]; total: number; limit: number; offset: number }>(
        `/executions${qs ? `?${qs}` : ''}`
      )
    },
  },
}

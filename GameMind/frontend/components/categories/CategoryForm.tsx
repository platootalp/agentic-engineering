'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Category, CategoryInput, DataSource } from '@/lib/api'

interface CategoryFormProps {
  initialData?: Category
  onSubmit: (data: CategoryInput) => Promise<void>
  onCancel?: () => void
}

const DATA_SOURCES: { value: DataSource; label: string }[] = [
  { value: 'exa', label: 'Exa 搜索' },
  { value: 'appstore', label: 'App Store 排行榜' },
  { value: 'google_play', label: 'Google Play 排行榜' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '')
}

export default function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [keywords, setKeywords] = useState(initialData?.keywords?.join('\n') || '')
  const [dataSources, setDataSources] = useState<DataSource[]>(initialData?.data_sources || ['exa'])
  const [priority, setPriority] = useState(initialData?.priority || 3)
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    if (!initialData?.slug) {
      setSlug(slugify(value))
    }
  }

  function toggleDataSource(ds: DataSource) {
    setDataSources((prev) =>
      prev.includes(ds) ? prev.filter((d) => d !== ds) : [...prev, ds]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('请输入品类名称'); return }
    if (!slug.trim()) { setError('请输入品类标识'); return }
    if (keywords.trim() === '') { setError('请输入至少一个关键词'); return }

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        keywords: keywords.split('\n').map((k) => k.trim()).filter(Boolean),
        data_sources: dataSources,
        priority,
        enabled,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-400 p-2 bg-red-500/10 rounded-md">{error}</p>
      )}

      <div className="space-y-1.5">
        <Label>品类名称</Label>
        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="例如：休闲解谜"
        />
      </div>

      <div className="space-y-1.5">
        <Label>品类标识 (slug)</Label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="例如：casual_puzzle"
          disabled={!!initialData?.slug}
        />
        <p className="text-xs text-subtle">唯一标识符，用于 URL 和数据关联</p>
      </div>

      <div className="space-y-1.5">
        <Label>关键词 (每行一个)</Label>
        <Textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="puzzle games&#10;casual puzzle&#10;match-3"
          className="min-h-[80px]"
        />
        <p className="text-xs text-subtle">这些关键词将用于数据源搜索</p>
      </div>

      <div className="space-y-2">
        <Label>数据源</Label>
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((ds) => (
            <button
              key={ds.value}
              type="button"
              onClick={() => toggleDataSource(ds.value)}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                dataSources.includes(ds.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted hover:border-primary/30'
              }`}
            >
              {ds.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>优先级 (1-5 星)</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setPriority(star)}
              className="text-lg transition-colors"
            >
              <span className={star <= priority ? 'text-yellow-400' : 'text-border'}>
                ★
              </span>
            </button>
          ))}
          <span className="text-xs text-muted ml-2 self-center">{priority} 星</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
        <Label className="!mb-0">{enabled ? '已启用' : '已禁用'}</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : initialData ? '保存更改' : '创建品类'}
        </Button>
      </div>
    </form>
  )
}

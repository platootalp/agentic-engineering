'use client'
import { useState } from 'react'
import { Pencil, Trash2, Eye, Star, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import CategoryForm from './CategoryForm'
import { api } from '@/lib/api'
import type { Category } from '@/lib/api'

interface CategoryListProps {
  categories: Category[]
  onDelete: (id: number) => Promise<void>
  onUpdate: (id: number, data: Partial<Category>) => Promise<void>
}

const DATA_SOURCE_LABELS: Record<string, string> = {
  exa: 'Exa 搜索',
  appstore: 'App Store',
  google_play: 'Google Play',
}

const DATA_SOURCE_COLORS: Record<string, string> = {
  exa: 'text-blue-400',
  appstore: 'text-green-400',
  google_play: 'text-yellow-400',
}

export default function CategoryList({ categories, onDelete, onUpdate }: CategoryListProps) {
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [previewId, setPreviewId] = useState<number | null>(null)
  const [previewResult, setPreviewResult] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)

  async function handleDelete() {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await onDelete(deleteId)
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  async function handlePreview(id: number) {
    setPreviewId(id)
    setPreviewResult(null)
    setPreviewing(true)
    try {
      const data = await api.categories.preview(id)
      setPreviewResult(`预估约 ${data.estimated_results} 条结果`)
    } catch {
      setPreviewResult('预览失败，请稍后重试')
    } finally {
      setPreviewing(false)
    }
  }

  function renderPriorityStars(priority: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= priority ? 'text-yellow-400 fill-yellow-400' : 'text-border'}`}
          />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
          <span className="text-3xl">📂</span>
        </div>
        <h2 className="text-xl font-semibold text-text mb-2">暂无品类</h2>
        <p className="text-muted mb-6">点击右上角按钮添加你的第一个分析品类</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <Card key={cat.id} className="bg-card border-border hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text">{cat.name}</h3>
                  <code className="text-xs text-muted bg-bg px-1.5 py-0.5 rounded">{cat.slug}</code>
                  {cat.enabled ? (
                    <Badge variant="success" className="text-xs">已启用</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">已禁用</Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="text-subtle">关键词:</span>
                    <span className="text-text">{cat.keywords?.slice(0, 3).join(', ')}{cat.keywords && cat.keywords.length > 3 ? `...` : ''}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <div className="flex items-center gap-1.5">
                    {(['exa', 'appstore', 'google_play'] as const).map((ds) => (
                      <Badge
                        key={ds}
                        variant={cat.data_sources?.includes(ds) ? 'outline' : 'secondary'}
                        className={`text-xs ${cat.data_sources?.includes(ds) ? DATA_SOURCE_COLORS[ds] : 'text-subtle'}`}
                      >
                        {cat.data_sources?.includes(ds) ? (
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                        ) : null}
                        {DATA_SOURCE_LABELS[ds]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-subtle">优先级:</span>
                    {renderPriorityStars(cat.priority || 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePreview(cat.id)}
                  title="关键词预览"
                >
                  <Eye className="w-4 h-4 text-muted" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditCategory(cat)}
                  title="编辑"
                >
                  <Pencil className="w-4 h-4 text-muted" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(cat.id)}
                  title="删除"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>

            {previewId === cat.id && (
              <div className="mt-3 p-2 bg-bg rounded-md text-xs text-muted">
                {previewing ? '正在预览...' : previewResult}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={!!editCategory} onOpenChange={(open) => !open && setEditCategory(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑品类</DialogTitle>
            <DialogDescription>修改品类配置</DialogDescription>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              initialData={editCategory}
              onSubmit={async (data) => {
                await onUpdate(editCategory.id, data)
                setEditCategory(null)
              }}
              onCancel={() => setEditCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              此操作无法撤销。删除后该品类的所有数据将被永久移除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
              取消
            </Button>
            <Button variant="default" onClick={handleDelete} disabled={deleting} className="bg-red-500 hover:bg-red-600">
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

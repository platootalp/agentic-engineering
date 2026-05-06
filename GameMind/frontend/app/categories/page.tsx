'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import Header from '@/components/Header'
import CategoryList from '@/components/categories/CategoryList'
import CategoryForm from '@/components/categories/CategoryForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import type { Category, CategoryInput } from '@/lib/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.categories.list()
      setCategories(data || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  async function handleCreate(data: CategoryInput) {
    const created = await api.categories.create(data)
    setCategories((prev) => [...prev, created])
    setShowAddDialog(false)
  }

  async function handleUpdate(id: number, data: Partial<CategoryInput>) {
    const updated = await api.categories.update(id, data)
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  async function handleDelete(id: number) {
    await api.categories.delete(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">品类管理</h1>
            <p className="text-muted text-sm mt-1">
              配置分析品类、关键词和数据源
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            添加品类
          </button>
        </div>

        {/* Category List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="h-5 bg-border rounded w-24 mb-1" />
                    <div className="h-3 bg-border rounded w-full mb-1" />
                    <div className="h-3 bg-border rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CategoryList
            categories={categories}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </main>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加品类</DialogTitle>
            <DialogDescription>创建新的分析品类</DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

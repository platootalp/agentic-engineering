import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { jobService } from '@/services/job.service'
import type { CreateJobRequest, JobSource } from '@/types/job'

const sourceOptions: { value: JobSource; label: string }[] = [
  { value: 'manual', label: '手动录入' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'boss', label: 'Boss直聘' },
  { value: 'lagou', label: '拉勾网' },
  { value: 'other', label: '其他' },
]

export function JobCreate() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateJobRequest>({
    companyName: '',
    position: '',
    location: '',
    salary: '',
    description: '',
    source: 'manual',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateJobRequest, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateJobRequest, string>> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = '请输入公司名称'
    }
    if (!formData.position.trim()) {
      newErrors.position = '请输入职位名称'
    }
    if (!formData.location.trim()) {
      newErrors.location = '请输入工作地点'
    }
    if (!formData.salary.trim()) {
      newErrors.salary = '请输入薪资范围'
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入JD原文'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setError(null)
    try {
      const job = await jobService.createJob(formData)
      navigate(`/jobs/${job.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败，请重试')
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof CreateJobRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            className="mb-4 -ml-4"
            onClick={() => navigate('/jobs')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">创建职位</h1>
          <p className="text-muted-foreground">
            填写职位信息，AI将自动分析JD内容
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    公司名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="例如：阿里巴巴"
                    className={errors.companyName ? 'border-destructive' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">
                    职位名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="例如：高级前端工程师"
                    className={errors.position ? 'border-destructive' : ''}
                  />
                  {errors.position && (
                    <p className="text-sm text-destructive">{errors.position}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    工作地点 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="例如：杭州·西湖区"
                    className={errors.location ? 'border-destructive' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">
                    薪资范围 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="例如：25k-40k·14薪"
                    className={errors.salary ? 'border-destructive' : ''}
                  />
                  {errors.salary && (
                    <p className="text-sm text-destructive">{errors.salary}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">来源渠道</Label>
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  JD原文 <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={12}
                  placeholder="请粘贴完整的职位描述..."
                  className={`flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y ${
                    errors.description ? 'border-destructive' : ''
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  提示：详细的JD原文有助于AI进行更准确的分析
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/jobs')}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  创建职位
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default JobCreate

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Briefcase, GraduationCap, Folder, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

import type { Experience, ExperienceType } from '@/types/experience'

interface ExperienceFormData {
  type: ExperienceType
  title: string
  organization: string
  location: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
  skills: string
  achievements: string
  is_highlighted: boolean
}

interface ExperienceFormProps {
  experience?: Experience | null
  defaultType?: ExperienceType
  onSubmit: (data: ExperienceFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

const typeOptions: { value: ExperienceType; label: string; icon: React.ReactNode }[] = [
  { value: 'work', label: '工作经历', icon: <Briefcase className="h-4 w-4" /> },
  { value: 'education', label: '教育经历', icon: <GraduationCap className="h-4 w-4" /> },
  { value: 'project', label: '项目经历', icon: <Folder className="h-4 w-4" /> },
]

const typeLabels: Record<ExperienceType, { title: string; organization: string }> = {
  work: { title: '职位名称', organization: '公司名称' },
  education: { title: '学位/专业', organization: '学校名称' },
  project: { title: '项目名称', organization: '所属公司/组织' },
}

export function ExperienceForm({
  experience,
  defaultType = 'work',
  onSubmit,
  onCancel,
  isLoading = false,
}: ExperienceFormProps) {
  const form = useForm<ExperienceFormData>({
    defaultValues: {
      type: defaultType,
      title: '',
      organization: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      skills: '',
      achievements: '',
      is_highlighted: false,
    },
  })

  const watchType = form.watch('type')
  const watchIsCurrent = form.watch('is_current')

  useEffect(() => {
    if (experience) {
      form.reset({
        type: experience.type,
        title: experience.title,
        organization: experience.organization,
        location: experience.location || '',
        start_date: experience.start_date,
        end_date: experience.end_date || '',
        is_current: experience.is_current,
        description: experience.description || '',
        skills: experience.skills.join(', '),
        achievements: experience.achievements.join('\n'),
        is_highlighted: experience.is_highlighted,
      })
    }
  }, [experience, form])

  const labels = typeLabels[watchType]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>经历类型</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!experience}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择经历类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.title}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`请输入${labels.title}`}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{labels.organization}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={`请输入${labels.organization}`}
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>地点（可选）</FormLabel>
              <FormControl>
                <Input placeholder="例如：北京、上海、远程" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>开始日期</FormLabel>
                <FormControl>
                  <Input type="date" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>结束日期</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    disabled={isLoading || watchIsCurrent}
                    {...field}
                    value={watchIsCurrent ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_current"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>当前正在进行</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="描述您的工作内容、项目职责或学习经历..."
                  rows={4}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>技能（用逗号分隔）</FormLabel>
              <FormControl>
                <Input
                  placeholder="例如：React, TypeScript, Node.js"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="achievements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>成就（每行一个）</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="描述您的主要成就和贡献..."
                  rows={4}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_highlighted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>高亮显示</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              取消
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {experience ? '保存修改' : '创建经历'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ExperienceForm

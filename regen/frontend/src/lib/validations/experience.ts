import { z } from 'zod'

export const experienceSchema = z.object({
  type: z.enum(['work', 'education', 'project']),
  title: z.string().min(1, '请输入职位/学位/项目名称'),
  organization: z.string().min(1, '请输入公司/学校名称'),
  location: z.string(),
  start_date: z.string().min(1, '请选择开始日期'),
  end_date: z.string(),
  is_current: z.boolean(),
  description: z.string(),
  skills: z.string(),
  achievements: z.string(),
  is_highlighted: z.boolean(),
})

export type ExperienceFormData = z.infer<typeof experienceSchema>

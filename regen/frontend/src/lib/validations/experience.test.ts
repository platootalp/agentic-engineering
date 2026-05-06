import { describe, it, expect } from 'vitest'
import { experienceSchema } from './experience'

describe('experienceSchema', () => {
  const validExperienceData = {
    type: 'work' as const,
    title: 'Software Engineer',
    organization: 'Tech Corp',
    location: 'Beijing',
    start_date: '2020-01-01',
    end_date: '2023-12-31',
    is_current: false,
    description: 'Developed web applications',
    skills: 'React, TypeScript',
    achievements: 'Increased performance by 50%',
    is_highlighted: true,
  }

  it('should validate correct work experience', () => {
    const result = experienceSchema.safeParse(validExperienceData)
    expect(result.success).toBe(true)
  })

  it('should validate education type', () => {
    const educationData = {
      ...validExperienceData,
      type: 'education' as const,
      title: 'Bachelor of Science',
      organization: 'University',
    }
    const result = experienceSchema.safeParse(educationData)
    expect(result.success).toBe(true)
  })

  it('should validate project type', () => {
    const projectData = {
      ...validExperienceData,
      type: 'project' as const,
      title: 'E-commerce Platform',
      organization: 'Personal',
    }
    const result = experienceSchema.safeParse(projectData)
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const invalidData = { ...validExperienceData, title: '' }
    const result = experienceSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入职位/学位/项目名称')
    }
  })

  it('should reject empty organization', () => {
    const invalidData = { ...validExperienceData, organization: '' }
    const result = experienceSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入公司/学校名称')
    }
  })

  it('should reject invalid type', () => {
    const invalidData = { ...validExperienceData, type: 'invalid' }
    const result = experienceSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty start_date', () => {
    const invalidData = { ...validExperienceData, start_date: '' }
    const result = experienceSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请选择开始日期')
    }
  })

  it('should allow empty optional fields', () => {
    const minimalData = {
      type: 'work' as const,
      title: 'Developer',
      organization: 'Company',
      location: '',
      start_date: '2020-01',
      end_date: '',
      is_current: true,
      description: '',
      skills: '',
      achievements: '',
      is_highlighted: false,
    }
    const result = experienceSchema.safeParse(minimalData)
    expect(result.success).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth'

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    }
    const result = loginSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject empty email', () => {
    const invalidData = {
      email: '',
      password: 'password123',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入邮箱地址')
    }
  })

  it('should reject invalid email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效的邮箱地址')
    }
  })

  it('should reject password shorter than 8 characters', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'short1',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码至少需要8个字符')
    }
  })

  it('should reject password without letters', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '12345678',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码必须包含至少一个字母')
    }
  })

  it('should reject password without numbers', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'password',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码必须包含至少一个数字')
    }
  })
})

describe('registerSchema', () => {
  const validRegisterData = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  }

  it('should validate correct registration data', () => {
    const result = registerSchema.safeParse(validRegisterData)
    expect(result.success).toBe(true)
  })

  it('should reject short first name', () => {
    const invalidData = { ...validRegisterData, first_name: 'J' }
    const result = registerSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名字至少需要2个字符')
    }
  })

  it('should reject long first name', () => {
    const invalidData = { ...validRegisterData, first_name: 'a'.repeat(51) }
    const result = registerSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('名字不能超过50个字符')
    }
  })

  it('should reject mismatched passwords', () => {
    const invalidData = {
      ...validRegisterData,
      confirmPassword: 'different123',
    }
    const result = registerSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('两次输入的密码不一致')
    }
  })

  it('should reject empty confirmPassword', () => {
    const invalidData = { ...validRegisterData, confirmPassword: '' }
    const result = registerSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })
})

describe('forgotPasswordSchema', () => {
  it('should validate correct email', () => {
    const validData = { email: 'user@example.com' }
    const result = forgotPasswordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject empty email', () => {
    const invalidData = { email: '' }
    const result = forgotPasswordSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid email format', () => {
    const invalidData = { email: 'not-an-email' }
    const result = forgotPasswordSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('should validate matching passwords', () => {
    const validData = {
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    }
    const result = resetPasswordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const invalidData = {
      password: 'newpassword123',
      confirmPassword: 'different123',
    }
    const result = resetPasswordSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('两次输入的密码不一致')
    }
  })

  it('should apply same password rules as login', () => {
    const invalidData = {
      password: 'weak',
      confirmPassword: 'weak',
    }
    const result = resetPasswordSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

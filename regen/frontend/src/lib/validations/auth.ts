import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(8, '密码至少8位')
    .regex(/[a-zA-Z]/, '密码必须包含至少一个字母')
    .regex(/\d/, '密码必须包含至少一个数字'),
})

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, '请输入名字')
      .min(2, '名字至少需要2个字符')
      .max(50, '名字不能超过50个字符'),
    last_name: z
      .string()
      .min(1, '请输入姓氏')
      .min(2, '姓氏至少需要2个字符')
      .max(50, '姓氏不能超过50个字符'),
    email: z
      .string()
      .min(1, '请输入邮箱地址')
      .email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(1, '请输入密码')
    .min(8, '密码至少8位')
      .regex(/[a-zA-Z]/, '密码必须包含至少一个字母')
      .regex(/\d/, '密码必须包含至少一个数字'),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密码不匹配',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱地址')
    .email('请输入有效的邮箱地址'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, '请输入新密码')
      .min(8, '密码至少8位')
      .regex(/[a-zA-Z]/, '密码必须包含至少一个字母')
      .regex(/\d/, '密码必须包含至少一个数字'),
    confirmPassword: z.string().min(1, '请确认新密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密码不匹配',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

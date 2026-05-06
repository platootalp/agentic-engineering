import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    const result = cn('base', isActive && 'active', isDisabled && 'disabled')
    expect(result).toBe('base active')
  })

  it('should handle object syntax', () => {
    const result = cn('base', { active: true, disabled: false })
    expect(result).toBe('base active')
  })

  it('should handle array syntax', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('should merge tailwind classes correctly (later wins)', () => {
    const result = cn('px-4 py-2', 'px-6')
    expect(result).toBe('py-2 px-6')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid')
    expect(result).toBe('base valid')
  })

  it('should handle empty strings', () => {
    const result = cn('base', '', 'valid')
    expect(result).toBe('base valid')
  })

  it('should handle complex combinations', () => {
    const isPrimary = true
    const isLarge = false
    const result = cn(
      'btn',
      isPrimary && 'btn-primary',
      isLarge && 'btn-large',
      { 'btn-disabled': false }
    )
    expect(result).toBe('btn btn-primary')
  })
})

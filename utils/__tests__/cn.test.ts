import { cn } from '../cn'

describe('cn utility', () => {
  it('should combine class names', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden')
    expect(result).toBe('base conditional')
  })

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid')
    expect(result).toBe('base valid')
  })

  it('should merge Tailwind classes correctly', () => {
    // Testing tailwind-merge functionality
    const result = cn('p-4', 'p-8') // should keep only p-8
    expect(result).toBe('p-8')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })
})

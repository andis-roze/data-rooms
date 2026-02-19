import { describe, expect, it } from 'vitest'
import { formatPathForDisplay, truncateMiddle } from '../../features/home/services/formatters'

describe('truncateMiddle', () => {
  it('returns unchanged value when it already fits', () => {
    expect(truncateMiddle('report.pdf', 32)).toBe('report.pdf')
  })

  it('truncates the middle for long values', () => {
    expect(truncateMiddle('very-long-file-name-that-needs-truncation.pdf', 20)).toBe('very-long...tion.pdf')
  })
})

describe('formatPathForDisplay', () => {
  it('keeps leading path context and filename when possible', () => {
    expect(formatPathForDisplay('/home/andis/Projects/home_assignment_implementation.md', 50)).toBe(
      '/home/andis/.../home_assignment_implementation.md',
    )
  })

  it('falls back to tail preservation when path still does not fit', () => {
    expect(formatPathForDisplay('/home/andis/Projects/home_assignment_implementation.md', 24)).toBe(
      '.../home_assignment_implementation.md',
    )
  })
})

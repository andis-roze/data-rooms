import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// MUI Menu/Select validates anchor layout; provide deterministic non-zero rects in JSDOM.
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  writable: true,
  value: function getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 120,
      bottom: 40,
      width: 120,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect
  },
})

afterEach(() => {
  cleanup()
})

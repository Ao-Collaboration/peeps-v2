/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom'

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (globalThis as any).vi?.fn?.()?.mockImplementation?.((query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (globalThis as any).vi?.fn?.() || (() => {}), // deprecated
    removeListener: (globalThis as any).vi?.fn?.() || (() => {}), // deprecated
    addEventListener: (globalThis as any).vi?.fn?.() || (() => {}),
    removeEventListener: (globalThis as any).vi?.fn?.() || (() => {}),
    dispatchEvent: (globalThis as any).vi?.fn?.() || (() => {}),
  })) || {
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  },
})

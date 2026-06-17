// Server actions transitively import `services/minio.ts`, which constructs a
// MinIO client at module load. Without an endpoint the constructor throws
// `InvalidEndpointError` before any test runs. CI provides no env files, so seed
// dummy values here — no connection is ever made (storage is mocked in tests).
process.env.MINIO_ENDPOINT ||= 'localhost'
process.env.MINIO_PORT ||= '9000'

if (typeof window !== 'undefined') {
  require('@testing-library/jest-dom')

  const { getComputedStyle } = window
  window.getComputedStyle = elt => getComputedStyle(elt)
  window.HTMLElement.prototype.scrollIntoView = () => {}

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  window.ResizeObserver = ResizeObserver
}

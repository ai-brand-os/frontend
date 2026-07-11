import { vi } from "vitest";

/**
 * jsdom doesn't implement these observers. Call from a test's `beforeEach`
 * (or setup.ts, if a feature needs it globally) before rendering components
 * that rely on them (e.g. virtualization, lazy images, popover positioning).
 */

export function mockIntersectionObserver() {
  class IntersectionObserverMock implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: number[] = [];
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  }

  vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
}

export function mockResizeObserver() {
  class ResizeObserverMock implements ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
}

export function mockMatchMedia(matches = false) {
  const matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

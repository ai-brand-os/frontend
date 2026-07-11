import { vi } from "vitest";

/**
 * jsdom's localStorage/sessionStorage already work, but real storage
 * persists across tests in the same file and can't be spied on directly.
 * These install an in-memory, spy-wrapped replacement.
 */
function createStorageMock(): Storage {
  let store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store = new Map();
    }),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    get length() {
      return store.size;
    },
  };
}

export function mockLocalStorage() {
  const storage = createStorageMock();
  vi.stubGlobal("localStorage", storage);
  return storage;
}

export function mockSessionStorage() {
  const storage = createStorageMock();
  vi.stubGlobal("sessionStorage", storage);
  return storage;
}

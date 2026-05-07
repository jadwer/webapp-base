import '@testing-library/jest-dom/vitest'

// happy-dom polyfills storage in some versions; this guards against
// environments where it is not present (older builds).
if (typeof globalThis.localStorage === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).localStorage = {
    _store: new Map<string, string>(),
    getItem(key: string) {
      return this._store.get(key) ?? null
    },
    setItem(key: string, value: string) {
      this._store.set(key, String(value))
    },
    removeItem(key: string) {
      this._store.delete(key)
    },
    clear() {
      this._store.clear()
    },
  }
}

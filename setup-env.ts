// Mock localStorage for node environment to prevent errors in plugins/dependencies
if (typeof localStorage === 'undefined' || localStorage === null) {
  // @ts-ignore
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  }
}

// Browser preview sessions last only for this tab. Native builds use encrypted SecureStore.
export const sessionStorage = {
  async getItem(key: string) { return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key); },
  async setItem(key: string, value: string) { window.sessionStorage.setItem(key, value); },
  async removeItem(key: string) { window.sessionStorage.removeItem(key); },
};

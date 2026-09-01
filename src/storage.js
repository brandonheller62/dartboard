/*
 * The component was built as a Claude artifact, where `window.storage` is
 * provided by the host. Outside that sandbox we back it with localStorage so
 * saved picks survive a refresh. Same async shape, so Dartboard.jsx is unchanged.
 */
const KEY_PREFIX = "dartboard-app:";

export function installStorageShim() {
  if (typeof window === "undefined" || window.storage) return;

  window.storage = {
    async get(key) {
      try {
        const value = localStorage.getItem(KEY_PREFIX + key);
        return value === null ? null : { value };
      } catch {
        return null;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(KEY_PREFIX + key, value);
      } catch {
        /* private mode / quota — picks just won't persist */
      }
    },
    async delete(key) {
      try {
        localStorage.removeItem(KEY_PREFIX + key);
      } catch {
        /* ignore */
      }
    },
  };
}

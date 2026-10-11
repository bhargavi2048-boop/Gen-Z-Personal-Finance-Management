/**
 * LocalStorage Persistence Service
 * Clean architectural abstraction for client-side storage with safe fallbacks and serialization.
 * Built with care by Bhargavi N
 */

export class StorageService {
  private static prefix = 'genz_finance_';

  public static getItem<T>(key: string, defaultValue: T): T {
    try {
      const fullKey = `${this.prefix}${key}`;
      let item = localStorage.getItem(fullKey);
      if (item === null) {
        // Fallback to legacy key format if present
        item = localStorage.getItem(`genz_finance_v1_${key}`);
      }
      if (item === null) return defaultValue;
      try {
        return JSON.parse(item) as T;
      } catch {
        return (item as unknown) as T;
      }
    } catch (error) {
      console.warn(`[StorageService] Failed to read key "${key}":`, error);
      return defaultValue;
    }
  }

  public static setItem<T>(key: string, value: T): boolean {
    try {
      const fullKey = `${this.prefix}${key}`;
      localStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to write key "${key}":`, error);
      return false;
    }
  }

  public static removeItem(key: string): void {
    try {
      const fullKey = `${this.prefix}${key}`;
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.warn(`[StorageService] Failed to remove key "${key}":`, error);
    }
  }

  public static clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (error) {
      console.warn('[StorageService] Failed to clear items:', error);
    }
  }
}

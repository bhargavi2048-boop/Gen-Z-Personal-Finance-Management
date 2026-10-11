import { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';

/**
 * useLocalStorage hook with synchronized local storage state
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return StorageService.getItem<T>(key, initialValue);
  });

  useEffect(() => {
    StorageService.setItem<T>(key, storedValue);
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

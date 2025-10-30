import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage with type safety
 * @param key - localStorage key
 * @param defaultValue - default value if nothing is stored
 * @returns [state, setState] tuple similar to useState
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        // Basic validation
        return parsed as T;
      }
    } catch (error) {
      console.error(`Error loading "${key}" from localStorage:`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving "${key}" to localStorage:`, error);
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * Specialized hook for boolean array with validation
 * @param key - localStorage key
 * @param defaultValue - default boolean array
 * @returns [state, setState] tuple
 */
export function useLocalStorageBooleanArray(key: string, defaultValue: boolean[]): [boolean[], (value: boolean[] | ((prev: boolean[]) => boolean[])) => void] {
  const [state, setState] = useState<boolean[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        // Validate that it's an array of booleans
        if (Array.isArray(parsed) && parsed.every((item): item is boolean => typeof item === 'boolean')) {
          return parsed;
        }
      }
    } catch (error) {
      console.error(`Error loading "${key}" from localStorage:`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving "${key}" to localStorage:`, error);
    }
  }, [key, state]);

  return [state, setState];
}

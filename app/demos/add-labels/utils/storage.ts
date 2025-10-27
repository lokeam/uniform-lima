import type { Label } from '@/app/demos/add-labels/types';
import { SESSION_STORAGE_KEY } from '@/app/demos/add-labels/constants';

/**
 * Loads labels from session storage with error handling
 */
export function loadLabelsFromStorage(): Label[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load labels from session storage:', error);
    return [];
  }
}

/**
 * Saves labels to session storage with error handling
 */
export function saveLabelsToStorage(labels: Label[]): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(labels));
  } catch (error) {
    console.error('Failed to save labels to session storage:', error);
  }
}

/**
 * Clears labels from session storage
 */
export function clearLabelsFromStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear labels from session storage:', error);
  }
}
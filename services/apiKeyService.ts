const STORAGE_KEY = 'finsight_gemini_api_key';

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch (e) {
    console.warn('Failed to store API key:', e);
  }
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return !!key && key.trim().length > 0;
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

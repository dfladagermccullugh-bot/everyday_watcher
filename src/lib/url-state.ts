'use client';

import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

type Patch = Record<string, string | string[] | null | undefined>;

/**
 * Exploration state lives in the URL so every view is shareable and the Back button
 * restores it. Writes use native history methods, which Next.js syncs with
 * useSearchParams without a server round trip. Safe to call outside Suspense.
 */
export function setQuery(patch: Patch, mode: 'push' | 'replace' = 'push') {
  const next = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(patch)) {
    const value = Array.isArray(v) ? v.join(',') : v;
    if (value == null || value === '') next.delete(k);
    else next.set(k, value);
  }
  const qs = next.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  if (url === `${window.location.pathname}${window.location.search}`) return;
  window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
}

/** Reads and writes URL state. Components using it must sit inside <Suspense>. */
export function useQueryState() {
  const params = useSearchParams();
  const get = useCallback((k: string) => params.get(k), [params]);
  const list = useCallback((k: string) => (params.get(k) ?? '').split(',').filter(Boolean), [params]);
  return { params, get, list, set: setQuery };
}

/** Opens the shared entry drawer from anywhere. */
export function useOpenEntry() {
  return useCallback((id: string | null) => setQuery({ entry: id }), []);
}

export function entryHref(id: string) {
  return `/atlas/${id}/`;
}

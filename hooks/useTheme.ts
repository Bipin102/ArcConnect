'use client'

import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'arcconnect_theme'

const listeners = new Set<() => void>()
let cached: Theme | null = null

function readInitial(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getSnapshot(): Theme {
  if (cached === null) cached = readInitial()
  return cached
}

function getServerSnapshot(): Theme {
  return 'light'
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

function applyTheme(theme: Theme) {
  cached = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // private browsing / storage disabled — theme just won't persist
  }
  listeners.forEach((listener) => listener())
}

// Manual light/dark toggle, persisted in localStorage. The initial class is
// set synchronously in a <head> script (see layout.tsx) so there's no
// flash-of-wrong-theme before hydration.
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = useCallback(() => {
    applyTheme(getSnapshot() === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggleTheme }
}

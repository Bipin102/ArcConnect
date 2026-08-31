'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'arcconnect_activity_stats_v1'

export interface ActivityStats {
  totalTransactions: number
  totalBridgedUsdc: number
  totalVolumeUsdc: number
}

const EMPTY_STATS: ActivityStats = { totalTransactions: 0, totalBridgedUsdc: 0, totalVolumeUsdc: 0 }

let cached: ActivityStats | null = null
const listeners = new Set<() => void>()

function readFromStorage(): ActivityStats {
  if (typeof window === 'undefined') return EMPTY_STATS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATS
    const parsed = JSON.parse(raw)
    return {
      totalTransactions: Number(parsed.totalTransactions) || 0,
      totalBridgedUsdc: Number(parsed.totalBridgedUsdc) || 0,
      totalVolumeUsdc: Number(parsed.totalVolumeUsdc) || 0,
    }
  } catch {
    return EMPTY_STATS
  }
}

function getSnapshot(): ActivityStats {
  if (cached === null) cached = readFromStorage()
  return cached
}

function getServerSnapshot(): ActivityStats {
  return EMPTY_STATS
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

function writeStats(next: ActivityStats) {
  cached = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // private browsing / storage disabled — stats just won't persist
  }
  listeners.forEach((listener) => listener())
}

// Local, per-device counter of transfers completed through this app —
// there's no backend here, so this tracks "this browser's" testnet
// activity rather than a global figure. Persisted in localStorage so it
// survives reloads across a demo/presentation.
export function useActivityStats() {
  const stats = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const recordTransaction = useCallback((amount: number, wasCrossChainBridge: boolean) => {
    if (!Number.isFinite(amount) || amount <= 0) return
    const prev = getSnapshot()
    writeStats({
      totalTransactions: prev.totalTransactions + 1,
      totalBridgedUsdc: prev.totalBridgedUsdc + (wasCrossChainBridge ? amount : 0),
      totalVolumeUsdc: prev.totalVolumeUsdc + amount,
    })
  }, [])

  const resetStats = useCallback(() => {
    writeStats(EMPTY_STATS)
  }, [])

  return { stats, recordTransaction, resetStats }
}

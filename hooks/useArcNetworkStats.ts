'use client'

import { useEffect, useState, useCallback } from 'react'
import { ARC_EXPLORER_URL } from '@/lib/constants'

export interface ArcNetworkStats {
  totalTransactions: number
  totalBlocks: number
  totalAddresses: number
  averageBlockTimeMs: number
}

interface ArcscanStatsResponse {
  total_transactions?: string
  total_blocks?: string
  total_addresses?: string
  average_block_time?: number
}

// Live, network-wide Arc Testnet totals pulled from Arcscan's public
// Blockscout API — not app-specific activity. See
// https://testnet.arcscan.app/api/v2/stats
export function useArcNetworkStats() {
  const [stats, setStats] = useState<ArcNetworkStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${ARC_EXPLORER_URL}/api/v2/stats`)
      if (!res.ok) throw new Error(`Arcscan responded with ${res.status}`)
      const data: ArcscanStatsResponse = await res.json()

      setStats({
        totalTransactions: Number(data.total_transactions) || 0,
        totalBlocks: Number(data.total_blocks) || 0,
        totalAddresses: Number(data.total_addresses) || 0,
        averageBlockTimeMs: data.average_block_time ?? 0,
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Arc network stats.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // fetchStats is async — state only updates inside its own then/catch,
    // never synchronously in this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats()
    const interval = setInterval(fetchStats, 30_000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, isLoading, error }
}

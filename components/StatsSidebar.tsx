'use client'

import { useArcNetworkStats } from '@/hooks/useArcNetworkStats'
import { ARC_EXPLORER_URL } from '@/lib/constants'

interface StatsSidebarProps {
  className?: string
}

function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

export function StatsSidebar({ className = '' }: StatsSidebarProps) {
  const { stats, isLoading, error } = useArcNetworkStats()

  return (
    <aside className={`widget-card rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">Arc Testnet</span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          Live
        </span>
      </div>

      {error && !stats ? (
        <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed">Couldn&apos;t load Arc network stats right now.</p>
      ) : (
        <div className="space-y-4">
          <div>
            {isLoading && !stats ? (
              <span className="shimmer inline-block w-24 h-8 rounded" />
            ) : (
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{formatCount(stats?.totalTransactions ?? 0)}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total transactions</p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/10" />

          <div>
            {isLoading && !stats ? (
              <span className="shimmer inline-block w-20 h-7 rounded" />
            ) : (
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{formatCount(stats?.totalBlocks ?? 0)}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total blocks</p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/10" />

          <div>
            {isLoading && !stats ? (
              <span className="shimmer inline-block w-20 h-7 rounded" />
            ) : (
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{formatCount(stats?.totalAddresses ?? 0)}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total addresses</p>
          </div>
        </div>
      )}

      <a
        href={ARC_EXPLORER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-[10px] text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-5 pt-4 border-t border-gray-100 dark:border-white/10 leading-relaxed"
      >
        Network-wide totals from Arcscan · updates every 30s
      </a>
    </aside>
  )
}

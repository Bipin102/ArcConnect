'use client'

import type { ActivityStats } from '@/hooks/useActivityStats'

interface StatsSidebarProps {
  stats: ActivityStats
  onReset: () => void
  className?: string
}

function formatUsdc(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function StatsSidebar({ stats, onReset, className = '' }: StatsSidebarProps) {
  return (
    <aside className={`widget-card rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Testnet Activity</span>
        {stats.totalTransactions > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{stats.totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total transactions</p>
        </div>

        <div className="h-px bg-gray-100" />

        <div>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{formatUsdc(stats.totalBridgedUsdc)}</p>
          <p className="text-xs text-gray-500 mt-0.5">USDC bridged cross-chain</p>
        </div>

        <div className="h-px bg-gray-100" />

        <div>
          <p className="text-xl font-semibold text-gray-700 tabular-nums">{formatUsdc(stats.totalVolumeUsdc)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total USDC moved</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-5 pt-4 border-t border-gray-100 leading-relaxed">
        Tracked on this device from completed transfers — resets if you clear browser storage.
      </p>
    </aside>
  )
}

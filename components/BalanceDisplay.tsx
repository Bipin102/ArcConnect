'use client'

import { useAccount } from 'wagmi'
import { useUsdcBalance } from '@/hooks/useUsdcBalance'
import { useArcBalance } from '@/hooks/useArcBalance'
import { ARC_FAUCET_URL, ARC_CHAIN_ID } from '@/lib/constants'

export function BalanceDisplay() {
  const { address, isConnected } = useAccount()
  const usdc = useUsdcBalance(address, ARC_CHAIN_ID)
  const gas = useArcBalance(address)

  if (!isConnected) return null

  const hasGas = gas.raw > 0n

  return (
    <div className="bg-white rounded-xl px-4 py-2.5 mb-4 border border-gray-200 shadow-sm fade-in flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${hasGas ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-gray-400">Gas USDC</span>
          <span className={`font-mono font-medium ${hasGas ? 'text-gray-700' : 'text-red-500'}`}>
            {gas.isLoading ? <span className="shimmer inline-block w-10 h-3 rounded" /> : gas.formatted}
          </span>
        </div>
        <div className="w-px h-3 bg-gray-200 flex-shrink-0" />
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">Arc USDC</span>
          <span className="font-mono font-medium text-gray-700">
            {usdc.isLoading ? <span className="shimmer inline-block w-10 h-3 rounded" /> : usdc.formatted}
          </span>
        </div>
      </div>
      {!hasGas && (
        <a
          href={ARC_FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 flex-shrink-0"
        >
          Get gas
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  )
}

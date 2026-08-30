'use client'

import { useAccount } from 'wagmi'
import { useUsdcBalance } from '@/hooks/useUsdcBalance'
import { useArcBalance } from '@/hooks/useArcBalance'
import { ARC_FAUCET_URL } from '@/lib/constants'

export function BalanceDisplay() {
  const { address, isConnected } = useAccount()
  const usdc = useUsdcBalance(address)
  const gas = useArcBalance(address)

  if (!isConnected) return null

  const hasGas = gas.raw > 0n

  return (
    <div className="glass rounded-2xl p-4 mb-4 fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Arc Testnet Balances
        </p>
        {!hasGas && (
          <a
            href={ARC_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            Get testnet USDC
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/3 rounded-xl p-3">
          <p className="text-xs text-gray-600 mb-1">Gas USDC</p>
          <p className={`text-sm font-semibold font-mono ${hasGas ? 'text-emerald-400' : 'text-red-400'}`}>
            {gas.isLoading ? <span className="shimmer inline-block w-16 h-4 rounded" /> : `${gas.formatted}`}
          </p>
          <p className="text-xs text-gray-700 mt-0.5">native · 18 dec</p>
        </div>
        <div className="bg-white/3 rounded-xl p-3">
          <p className="text-xs text-gray-600 mb-1">ERC-20 USDC</p>
          <p className={`text-sm font-semibold font-mono ${usdc.raw > 0n ? 'text-emerald-400' : 'text-gray-500'}`}>
            {usdc.isLoading ? <span className="shimmer inline-block w-16 h-4 rounded" /> : `${usdc.formatted}`}
          </p>
          <p className="text-xs text-gray-700 mt-0.5">token · 6 dec</p>
        </div>
      </div>
    </div>
  )
}

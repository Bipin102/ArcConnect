'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { ChainIcon } from './ChainIcon'
import { ARC_CHAIN_ID, CHAIN_NAMES, SUPPORTED_SOURCE_CHAIN_IDS } from '@/lib/constants'

const ALL_SUPPORTED = [ARC_CHAIN_ID, ...SUPPORTED_SOURCE_CHAIN_IDS]

export function NetworkGuard() {
  const { chainId, isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected || !chainId) return null
  if (ALL_SUPPORTED.includes(chainId as (typeof ALL_SUPPORTED)[number])) return null

  return (
    <div className="widget-card rounded-2xl p-4 mb-4 border border-amber-200 dark:border-amber-400/25 fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Unsupported network</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Switch to a supported testnet to continue bridging.</p>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_SOURCE_CHAIN_IDS.map((id) => (
              <button
                key={id}
                onClick={() => switchChain({ chainId: id })}
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 pl-1.5 pr-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChainIcon chainId={id} size={16} />
                {CHAIN_NAMES[id]}
              </button>
            ))}
            <button
              onClick={() => switchChain({ chainId: ARC_CHAIN_ID })}
              disabled={isPending}
              className="flex items-center gap-1.5 text-xs bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/25 text-indigo-600 dark:text-indigo-400 pl-1.5 pr-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <ChainIcon chainId={ARC_CHAIN_ID} size={16} />
              Arc Testnet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

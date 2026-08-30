'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { ARC_CHAIN_ID, CHAIN_NAMES, SUPPORTED_SOURCE_CHAIN_IDS } from '@/lib/constants'

const ALL_SUPPORTED = [ARC_CHAIN_ID, ...SUPPORTED_SOURCE_CHAIN_IDS]

export function NetworkGuard() {
  const { chainId, isConnected } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected || !chainId) return null
  if (ALL_SUPPORTED.includes(chainId as (typeof ALL_SUPPORTED)[number])) return null

  return (
    <div className="glass rounded-2xl p-4 mb-4 border border-amber-500/20 fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-300 mb-2">Unsupported Network</p>
          <p className="text-xs text-gray-500 mb-3">Switch to a supported testnet to continue.</p>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_SOURCE_CHAIN_IDS.map((id) => (
              <button
                key={id}
                onClick={() => switchChain({ chainId: id })}
                disabled={isPending}
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {CHAIN_NAMES[id]}
              </button>
            ))}
            <button
              onClick={() => switchChain({ chainId: ARC_CHAIN_ID })}
              disabled={isPending}
              className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Arc Testnet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

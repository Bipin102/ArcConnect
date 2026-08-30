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
    <div className="w-full max-w-lg mx-auto mb-4 bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
      <p className="text-yellow-300 text-sm mb-3">
        <span className="font-semibold">Unsupported network.</span> Switch to one of the supported
        testnets to continue.
      </p>
      <div className="flex flex-wrap gap-2">
        {SUPPORTED_SOURCE_CHAIN_IDS.map((id) => (
          <button
            key={id}
            onClick={() => switchChain({ chainId: id })}
            disabled={isPending}
            className="text-xs bg-yellow-700/40 hover:bg-yellow-700/70 text-yellow-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {CHAIN_NAMES[id]}
          </button>
        ))}
        <button
          onClick={() => switchChain({ chainId: ARC_CHAIN_ID })}
          disabled={isPending}
          className="text-xs bg-blue-700/40 hover:bg-blue-700/70 text-blue-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          Arc Testnet
        </button>
      </div>
    </div>
  )
}

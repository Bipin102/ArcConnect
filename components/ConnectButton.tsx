'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { shortenAddress } from '@/lib/utils'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-sm text-gray-700 font-mono">{shortenAddress(address)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5"
        >
          Disconnect
        </button>
      </div>
    )
  }

  const injectedConnector = connectors.find((c) => c.id === 'injected')
  const wcConnector = connectors.find((c) => c.id === 'walletConnect')

  return (
    <div className="flex gap-2">
      {injectedConnector && (
        <button
          onClick={() => connect({ connector: injectedConnector })}
          disabled={isPending}
          className="btn-dark text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting
            </span>
          ) : (
            'Connect'
          )}
        </button>
      )}
      {wcConnector && (
        <button
          onClick={() => connect({ connector: wcConnector })}
          disabled={isPending}
          className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          WalletConnect
        </button>
      )}
      {connectors.length === 0 && (
        <p className="text-sm text-gray-500">Install MetaMask to continue.</p>
      )}
    </div>
  )
}

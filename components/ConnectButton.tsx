'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { shortenAddress } from '@/lib/utils'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 font-mono bg-gray-800 px-3 py-1.5 rounded-lg">
          {shortenAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-800 hover:border-red-600 transition-colors"
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
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      {wcConnector && (
        <button
          onClick={() => connect({ connector: wcConnector })}
          disabled={isPending}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          WalletConnect
        </button>
      )}
      {connectors.length === 0 && (
        <p className="text-sm text-gray-500">No wallet detected. Install MetaMask.</p>
      )}
    </div>
  )
}

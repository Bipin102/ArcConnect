'use client'

import { useConnect } from 'wagmi'
import { useHasInjectedProvider } from '@/hooks/useHasInjectedProvider'
import { formatConnectError } from '@/lib/utils'

interface ConnectPromptProps {
  title?: string
  subtitle?: string
}

// Wallet-connect card shared by any feature that needs a connected wallet.
// Hides the injected connector entirely when no browser-extension wallet is
// present (mobile in-app browsers, plain mobile Safari/Chrome) so the only
// option offered is one that can actually succeed there.
export function ConnectPrompt({
  title = 'Connect your wallet',
  subtitle = 'Choose your wallet to continue.',
}: ConnectPromptProps) {
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect()
  const hasInjectedProvider = useHasInjectedProvider()

  const injected = connectors.find((c) => c.id === 'injected')
  const wc = connectors.find((c) => c.id === 'walletConnect')

  return (
    <div className="widget-card rounded-3xl p-8 text-center fade-in space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-400/20 flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <div>
        <p className="text-gray-900 dark:text-white font-semibold mb-1">{title}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {injected && hasInjectedProvider && (
          <button
            onClick={() => connect({ connector: injected })}
            disabled={isConnecting}
            className="btn-gradient w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        )}
        {wc && (
          <button
            onClick={() => connect({ connector: wc })}
            disabled={isConnecting}
            className={
              hasInjectedProvider
                ? 'w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50'
                : 'btn-gradient w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 shadow-lg shadow-indigo-500/15'
            }
          >
            {isConnecting && !hasInjectedProvider ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              'WalletConnect'
            )}
          </button>
        )}
        {!injected && !wc && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No wallet connector available.</p>
        )}
        {!hasInjectedProvider && (
          <p className="text-xs text-gray-400 dark:text-gray-500">No wallet extension in this browser — use WalletConnect to open your wallet app.</p>
        )}
        {connectError && (
          <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-400/20 rounded-lg px-3 py-2 text-left">
            {formatConnectError(connectError)}
          </p>
        )}
      </div>
    </div>
  )
}

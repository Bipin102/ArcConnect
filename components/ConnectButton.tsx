'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { shortenAddress } from '@/lib/utils'

const CONNECTOR_LABELS: Record<string, string> = {
  injected: 'Browser Wallet',
  walletConnect: 'WalletConnect',
}

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

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

  if (connectors.length === 0) {
    return <p className="text-sm text-gray-500">Install MetaMask to continue.</p>
  }

  // One connector — a single button. Multiple connectors — one button that
  // opens a dropdown, instead of stacking separate buttons that overflow a
  // compact mobile nav.
  if (connectors.length === 1) {
    const connector = connectors[0]
    return (
      <div className="relative">
        <button
          onClick={() => connect({ connector })}
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
        {error && (
          <p className="absolute right-0 top-full mt-2 w-56 text-xs text-red-500 bg-white border border-red-100 rounded-lg px-3 py-2 shadow-sm z-20">
            {error.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        disabled={isPending}
        className="btn-dark text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        {isPending ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting
          </>
        ) : (
          <>
            Connect
            <svg className={`w-3.5 h-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 z-20 w-48 widget-card rounded-2xl p-1.5 fade-in">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              onClick={() => {
                connect({ connector })
                setMenuOpen(false)
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {CONNECTOR_LABELS[connector.id] ?? connector.name}
            </button>
          ))}
        </div>
      )}

      {error && !menuOpen && (
        <p className="absolute right-0 top-full mt-2 w-56 text-xs text-red-500 bg-white border border-red-100 rounded-lg px-3 py-2 shadow-sm z-20">
          {error.message}
        </p>
      )}
    </div>
  )
}

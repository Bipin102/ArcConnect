'use client'

import { PayStatus } from '@/hooks/usePay'
import { ExplorerLink } from './ExplorerLink'
import { shortenAddress } from '@/lib/utils'

interface TxStatusProps {
  status: PayStatus
  onReset: () => void
}

export function TxStatus({ status, onReset }: TxStatusProps) {
  if (status.state === 'idle') return null

  if (status.state === 'pending') {
    return (
      <div className="glass rounded-2xl p-5 border border-indigo-500/20 fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{status.message}</p>
            <p className="text-xs text-gray-600 mt-0.5">Cross-chain transfers take 1–3 minutes.</p>
          </div>
        </div>
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 shimmer" />
        </div>
      </div>
    )
  }

  if (status.state === 'success') {
    return (
      <div className="glass rounded-2xl p-5 border border-emerald-500/20 fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-400">Payment Confirmed</p>
            <p className="text-xs text-gray-500 mt-0.5">Successfully sent to Arc Testnet</p>
          </div>
        </div>

        <div className="bg-white/3 rounded-xl p-3 space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Amount</span>
            <span className="text-sm font-semibold font-mono text-white">{status.amount} USDC</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Recipient</span>
            <span className="text-sm font-mono text-gray-300">{shortenAddress(status.recipient)}</span>
          </div>
        </div>

        {status.txHash && (
          <div className="mb-4">
            <ExplorerLink txHash={status.txHash} explorerUrl={status.explorerUrl} />
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full text-sm text-gray-500 hover:text-white transition-colors py-2 border border-white/5 hover:border-white/10 rounded-xl"
        >
          Make another payment
        </button>
      </div>
    )
  }

  if (status.state === 'error') {
    return (
      <div className="glass rounded-2xl p-5 border border-red-500/20 fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-400">Payment Failed</p>
        </div>
        <p className="text-xs text-gray-500 break-words mb-4 leading-relaxed">{status.message}</p>
        <button
          onClick={onReset}
          className="w-full text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-2.5 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return null
}

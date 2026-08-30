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
      <div className="w-full max-w-lg mx-auto mt-4 bg-blue-900/30 border border-blue-700 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-blue-300 text-sm">{status.message}</p>
        </div>
        <p className="text-gray-500 text-xs mt-2 ml-8">
          Cross-chain transfers take 1–3 minutes. Do not close this tab.
        </p>
      </div>
    )
  }

  if (status.state === 'success') {
    return (
      <div className="w-full max-w-lg mx-auto mt-4 bg-green-900/30 border border-green-700 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-xl">&#10003;</span>
          <p className="text-green-300 font-semibold">Payment Sent</p>
        </div>
        <div className="text-sm space-y-1.5 text-gray-300">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-mono">{status.amount} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Recipient</span>
            <span className="font-mono">{shortenAddress(status.recipient)}</span>
          </div>
        </div>
        {status.txHash && (
          <ExplorerLink txHash={status.txHash} explorerUrl={status.explorerUrl} />
        )}
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-white mt-1 transition-colors"
        >
          Make another payment
        </button>
      </div>
    )
  }

  if (status.state === 'error') {
    return (
      <div className="w-full max-w-lg mx-auto mt-4 bg-red-900/30 border border-red-700 rounded-xl p-5 space-y-3">
        <p className="text-red-400 font-semibold">Payment Failed</p>
        <p className="text-sm text-red-300 break-words">{status.message}</p>
        <button
          onClick={onReset}
          className="text-sm bg-red-700/40 hover:bg-red-700/70 text-red-200 px-4 py-2 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return null
}

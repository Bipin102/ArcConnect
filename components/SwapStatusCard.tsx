'use client'

import { SwapStatus } from '@/hooks/useSwap'
import { ExplorerLink } from './ExplorerLink'

interface SwapStatusCardProps {
  status: SwapStatus
  onReset: () => void
}

export function SwapStatusCard({ status, onReset }: SwapStatusCardProps) {
  if (status.state === 'idle') return null

  if (status.state === 'pending') {
    return (
      <div className="widget-card rounded-2xl p-5 border border-indigo-100 fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{status.message}</p>
            <p className="text-xs text-gray-400 mt-0.5">Usually settles in a few seconds on Arc.</p>
          </div>
        </div>
        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 shimmer" />
        </div>
      </div>
    )
  }

  if (status.state === 'success') {
    return (
      <div className="widget-card rounded-2xl p-5 border border-emerald-100 fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-600">Swap Confirmed</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {status.tokenIn} → {status.tokenOut} on Arc Testnet
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">You paid</span>
            <span className="text-sm font-semibold font-mono text-gray-900">
              {status.amountIn} {status.tokenIn}
            </span>
          </div>
          {status.amountOut && (
            <>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">You received</span>
                <span className="text-sm font-semibold font-mono text-gray-900">
                  {status.amountOut} {status.tokenOut}
                </span>
              </div>
            </>
          )}
        </div>

        {status.txHash && (
          <div className="mb-4">
            <ExplorerLink txHash={status.txHash} explorerUrl={status.explorerUrl} label="Arcscan" />
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors py-2 border border-gray-200 hover:border-gray-300 rounded-xl"
        >
          Make another swap
        </button>
      </div>
    )
  }

  if (status.state === 'error') {
    return (
      <div className="widget-card rounded-2xl p-5 border border-red-100 fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-500">Swap Failed</p>
        </div>
        <p className="text-xs text-gray-500 break-words mb-4 leading-relaxed">{status.message}</p>
        <button
          onClick={onReset}
          className="w-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 py-2.5 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return null
}

'use client'

import { PayStatus } from '@/hooks/usePay'
import { useRecordReceipt } from '@/hooks/useRecordReceipt'
import { ExplorerLink } from './ExplorerLink'
import { shortenAddress } from '@/lib/utils'
import { CHAIN_NAMES, EXPLORER_NAMES, ARC_CHAIN_ID } from '@/lib/constants'

interface TxStatusProps {
  status: PayStatus
  onReset: () => void
}

export function TxStatus({ status, onReset }: TxStatusProps) {
  const { recordReceipt, status: receiptStatus } = useRecordReceipt()

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
            <p className="text-xs text-gray-400 mt-0.5">Cross-chain transfers take 1–3 minutes.</p>
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
            <p className="text-sm font-semibold text-emerald-600">Payment Confirmed</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Successfully sent to {CHAIN_NAMES[status.destinationChainId] ?? 'destination chain'}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Amount</span>
            <span className="text-sm font-semibold font-mono text-gray-900">{status.amount} USDC</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Recipient</span>
            <span className="text-sm font-mono text-gray-600">{shortenAddress(status.recipient)}</span>
          </div>
        </div>

        {status.txHash && (
          <div className="mb-4">
            <ExplorerLink
              txHash={status.txHash}
              explorerUrl={status.explorerUrl}
              label={EXPLORER_NAMES[status.destinationChainId] ?? 'Explorer'}
            />
          </div>
        )}

        {status.txHash && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4">
            {receiptStatus.state === 'success' ? (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Receipt recorded on Arc</p>
                  <ExplorerLink txHash={receiptStatus.txHash} explorerUrl={receiptStatus.explorerUrl} label="Arcscan" />
                </div>
              </div>
            ) : receiptStatus.state === 'pending' ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin flex-shrink-0" />
                <p className="text-xs text-gray-600">{receiptStatus.message}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                  Optionally log this payment on Arc for a public, tamper-evident receipt.
                  {status.sourceChainId !== ARC_CHAIN_ID && ' Requires switching your wallet to Arc Testnet.'}
                </p>
                {receiptStatus.state === 'error' && (
                  <p className="text-xs text-red-500 mb-2 break-words">{receiptStatus.message}</p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    recordReceipt({
                      recipient: status.recipient as `0x${string}`,
                      amount: status.amount,
                      sourceChainId: status.sourceChainId,
                      refTxHash: status.txHash,
                    })
                  }
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {receiptStatus.state === 'error' ? 'Try recording again' : 'Record on-chain receipt'}
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors py-2 border border-gray-200 hover:border-gray-300 rounded-xl"
        >
          Make another payment
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
          <p className="text-sm font-semibold text-red-500">Payment Failed</p>
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

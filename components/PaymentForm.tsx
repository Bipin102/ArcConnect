'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { usePay } from '@/hooks/usePay'
import { TxStatus } from './TxStatus'
import { CHAIN_NAMES, ARC_CHAIN_ID, SUPPORTED_SOURCE_CHAIN_IDS } from '@/lib/constants'

const ALL_SUPPORTED = [ARC_CHAIN_ID, ...SUPPORTED_SOURCE_CHAIN_IDS]

export function PaymentForm() {
  const { isConnected, chainId } = useAccount()
  const { pay, status, reset } = usePay()

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({})

  const currentChainName = chainId ? (CHAIN_NAMES[chainId] ?? `Chain ${chainId}`) : '—'
  const isSupportedChain = chainId
    ? ALL_SUPPORTED.includes(chainId as (typeof ALL_SUPPORTED)[number])
    : false
  const isOnArc = chainId === ARC_CHAIN_ID
  const isPending = status.state === 'pending'

  function validate() {
    const errs: typeof errors = {}
    if (!isAddress(recipient)) errs.recipient = 'Enter a valid 0x address.'
    const parsed = parseFloat(amount)
    if (!amount || isNaN(parsed) || parsed <= 0) errs.amount = 'Enter an amount greater than 0.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await pay(recipient, amount)
  }

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-10 text-center fade-in">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </div>
        <p className="text-gray-300 font-medium mb-1">Connect your wallet</p>
        <p className="text-gray-600 text-sm">Connect above to start sending USDC across chains.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 fade-in">
      <div className="glass rounded-2xl p-6 space-y-5">

        {/* Source chain indicator */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600 uppercase tracking-widest font-medium">From</span>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isSupportedChain ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-300 font-medium">{currentChainName}</span>
          </div>
        </div>

        {isOnArc && (
          <div className="flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-indigo-300">On Arc Testnet — sending same-chain USDC.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
              Recipient · Arc Testnet
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setErrors((p) => ({ ...p, recipient: undefined })) }}
              placeholder="0x0000...0000"
              disabled={isPending}
              className="w-full bg-white/4 border border-white/8 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm font-mono text-gray-100 placeholder-gray-700 outline-none transition-all disabled:opacity-40"
            />
            {errors.recipient && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.recipient}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: undefined })) }}
                placeholder="0.00"
                min="0"
                step="0.000001"
                disabled={isPending}
                className="w-full bg-white/4 border border-white/8 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-700 outline-none transition-all disabled:opacity-40 pr-20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                USDC
              </span>
            </div>
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.amount}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !isSupportedChain}
            className="btn-gradient w-full text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-indigo-500/20"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : isOnArc ? (
              'Send USDC'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Pay Cross-Chain
              </span>
            )}
          </button>
        </form>

        {!isSupportedChain && isConnected && (
          <p className="text-xs text-gray-600 text-center">Switch to a supported chain to continue.</p>
        )}

        <div className="flex items-center justify-center pt-1">
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need testnet USDC? Visit faucet.circle.com
          </a>
        </div>
      </div>

      <TxStatus status={status} onReset={reset} />
    </div>
  )
}

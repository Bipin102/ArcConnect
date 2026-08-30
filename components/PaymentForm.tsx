'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import { usePay } from '@/hooks/usePay'
import { TxStatus } from './TxStatus'
import { FaucetLink } from './FaucetLink'
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
      <div className="w-full max-w-lg mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
        <p className="text-gray-400 text-sm">Connect your wallet to send USDC.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-5">
        {/* Chain banner */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Source chain</span>
          <span
            className={`font-medium px-2 py-0.5 rounded text-xs ${
              isSupportedChain
                ? 'bg-green-900/40 text-green-400'
                : 'bg-red-900/40 text-red-400'
            }`}
          >
            {currentChainName}
          </span>
        </div>

        {isOnArc && (
          <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-800 rounded-lg px-3 py-2">
            You are on Arc Testnet — sending same-chain USDC.
          </p>
        )}

        {!isSupportedChain && (
          <p className="text-xs text-red-400">Switch to a supported chain above to continue.</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Recipient address (on Arc Testnet)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setErrors((p) => ({ ...p, recipient: undefined })) }}
              placeholder="0x..."
              disabled={isPending}
              className="w-full bg-gray-900 border border-gray-600 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm font-mono text-white placeholder-gray-600 outline-none transition-colors disabled:opacity-50"
            />
            {errors.recipient && (
              <p className="text-red-400 text-xs mt-1">{errors.recipient}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Amount (USDC)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: undefined })) }}
                placeholder="0.00"
                min="0"
                step="0.000001"
                disabled={isPending}
                className="w-full bg-gray-900 border border-gray-600 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors disabled:opacity-50 pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                USDC
              </span>
            </div>
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !isSupportedChain}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {isPending ? 'Processing...' : isOnArc ? 'Send USDC' : 'Pay (Cross-Chain)'}
          </button>
        </form>

        <div className="pt-1 border-t border-gray-700 text-center">
          <FaucetLink />
        </div>
      </div>

      <TxStatus status={status} onReset={reset} />
    </div>
  )
}

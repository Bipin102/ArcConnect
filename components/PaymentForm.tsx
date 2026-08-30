'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount, useConnect, useSwitchChain } from 'wagmi'
import { isAddress, formatUnits } from 'viem'
import { usePay } from '@/hooks/usePay'
import { useUsdcBalance } from '@/hooks/useUsdcBalance'
import { useNativeGasBalance } from '@/hooks/useNativeGasBalance'
import { TxStatus } from './TxStatus'
import { ChainIcon } from './ChainIcon'
import {
  CHAIN_NAMES,
  ARC_CHAIN_ID,
  SUPPORTED_SOURCE_CHAIN_IDS,
  ERC20_USDC_DECIMALS,
  NATIVE_GAS_SYMBOLS,
  NATIVE_GAS_FAUCET_URLS,
  ARC_FAUCET_URL,
} from '@/lib/constants'

const ALL_SUPPORTED = [ARC_CHAIN_ID, ...SUPPORTED_SOURCE_CHAIN_IDS]
const SELECTABLE_CHAINS = [...SUPPORTED_SOURCE_CHAIN_IDS, ARC_CHAIN_ID]

export function PaymentForm() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { pay, status, reset } = usePay()

  const [destinationChainId, setDestinationChainId] = useState<number>(ARC_CHAIN_ID)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({})
  const [fromMenuOpen, setFromMenuOpen] = useState(false)
  const [toMenuOpen, setToMenuOpen] = useState(false)
  const fromMenuRef = useRef<HTMLDivElement>(null)
  const toMenuRef = useRef<HTMLDivElement>(null)

  const sourceUsdc = useUsdcBalance(address, chainId)
  const destinationUsdc = useUsdcBalance(address, destinationChainId)
  const sourceGas = useNativeGasBalance(address, chainId)
  const gasSymbol = chainId ? (NATIVE_GAS_SYMBOLS[chainId] ?? 'gas') : 'gas'
  const gasFaucetUrl = chainId === ARC_CHAIN_ID ? ARC_FAUCET_URL : chainId ? NATIVE_GAS_FAUCET_URLS[chainId] : undefined

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (fromMenuRef.current && !fromMenuRef.current.contains(e.target as Node)) setFromMenuOpen(false)
      if (toMenuRef.current && !toMenuRef.current.contains(e.target as Node)) setToMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  // Pick up the post-transaction balance right away instead of waiting on the poll interval
  useEffect(() => {
    if (status.state === 'success' || status.state === 'error') {
      sourceUsdc.refetch()
      destinationUsdc.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.state])

  const currentChainName = chainId ? (CHAIN_NAMES[chainId] ?? `Chain ${chainId}`) : 'Select network'
  const destinationChainName = CHAIN_NAMES[destinationChainId] ?? `Chain ${destinationChainId}`
  const isSupportedChain = chainId
    ? ALL_SUPPORTED.includes(chainId as (typeof ALL_SUPPORTED)[number])
    : false
  const isSameChain = chainId === destinationChainId
  const isPending = status.state === 'pending'
  const canReverse = !!chainId && !isSwitching && !isPending

  function handleReverse() {
    if (!chainId || !canReverse) return
    const newSource = destinationChainId
    const newDestination = chainId
    switchChain({ chainId: newSource })
    setDestinationChainId(newDestination)
  }

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
    await pay(recipient, amount, destinationChainId)
  }

  if (!isConnected) {
    const injected = connectors.find((c) => c.id === 'injected')
    const wc = connectors.find((c) => c.id === 'walletConnect')

    return (
      <div className="widget-card rounded-3xl p-8 text-center fade-in space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <p className="text-gray-900 font-semibold mb-1">Connect your wallet</p>
          <p className="text-gray-500 text-sm">Choose your wallet to start bridging USDC.</p>
        </div>
        <div className="space-y-2">
          {injected && (
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
              className="w-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              WalletConnect
            </button>
          )}
          {connectors.length === 0 && (
            <p className="text-sm text-gray-500">No wallet detected. Install MetaMask to continue.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 fade-in">
      <div className="widget-card rounded-3xl p-4">
        {/* Widget header */}
        <div className="flex items-center justify-between px-1.5 pb-3">
          <span className="text-sm font-semibold text-gray-900">Bridge</span>
          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Circle CCTP
          </span>
        </div>

        <div className="relative space-y-1">
          {/* From slot */}
          <div className="slot-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">From</span>
              {!isSupportedChain ? (
                <span className="flex items-center gap-1 text-[11px] text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Unsupported
                </span>
              ) : (
                <span className="text-[11px] text-gray-400">
                  Balance: {sourceUsdc.isLoading ? '—' : sourceUsdc.formatted}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="relative" ref={fromMenuRef}>
                <button
                  type="button"
                  onClick={() => setFromMenuOpen((v) => !v)}
                  disabled={isSwitching}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl pl-2 pr-2.5 py-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {chainId ? <ChainIcon chainId={chainId} size={22} /> : (
                    <span className="w-[22px] h-[22px] rounded-full bg-gray-100" />
                  )}
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{currentChainName}</span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${fromMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {fromMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 z-20 w-56 widget-card rounded-2xl p-1.5 fade-in">
                    {SELECTABLE_CHAINS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { switchChain({ chainId: id }); setFromMenuOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                          id === chainId ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChainIcon chainId={id} size={20} />
                        {CHAIN_NAMES[id]}
                        {id === chainId && (
                          <svg className="w-3.5 h-3.5 ml-auto text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: undefined })) }}
                placeholder="0.00"
                min="0"
                step="0.000001"
                disabled={isPending}
                className="flex-1 min-w-0 bg-transparent text-right text-2xl font-semibold text-gray-900 placeholder-gray-300 outline-none disabled:opacity-40"
              />
            </div>
            {isSupportedChain && sourceUsdc.raw > 0n && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => { setAmount(formatUnits(sourceUsdc.raw, ERC20_USDC_DECIMALS)); setErrors((p) => ({ ...p, amount: undefined })) }}
                  disabled={isPending}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-40"
                >
                  Max
                </button>
              </div>
            )}
            {isSupportedChain && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${sourceGas.raw > 0n ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-gray-400">
                  Gas: {sourceGas.isLoading ? '—' : sourceGas.formatted} {gasSymbol}
                </span>
                {sourceGas.raw === 0n && gasFaucetUrl && (
                  <a
                    href={gasFaucetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 transition-colors ml-auto"
                  >
                    Get {gasSymbol}
                  </a>
                )}
              </div>
            )}
            {errors.amount && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.amount}
              </p>
            )}
          </div>

          {/* Swap direction divider — reverses From/To */}
          <div className="flex justify-center relative h-0">
            <button
              type="button"
              onClick={handleReverse}
              disabled={!canReverse}
              aria-label="Reverse direction"
              title="Reverse direction"
              className="swap-divider absolute -top-4 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          {/* To slot */}
          <div className="slot-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">To</span>
              <span className="text-[11px] text-gray-400">
                Balance: {destinationUsdc.isLoading ? '—' : destinationUsdc.formatted}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="relative" ref={toMenuRef}>
                <button
                  type="button"
                  onClick={() => setToMenuOpen((v) => !v)}
                  disabled={isPending}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl pl-2 pr-2.5 py-2 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <ChainIcon chainId={destinationChainId} size={22} />
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{destinationChainName}</span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${toMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {toMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 z-20 w-56 widget-card rounded-2xl p-1.5 fade-in">
                    {SELECTABLE_CHAINS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { setDestinationChainId(id); setToMenuOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors ${
                          id === destinationChainId ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <ChainIcon chainId={id} size={20} />
                        {CHAIN_NAMES[id]}
                        {id === destinationChainId && (
                          <svg className="w-3.5 h-3.5 ml-auto text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="flex-1 min-w-0 text-right text-2xl font-semibold text-gray-300 truncate">
                {amount || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {isSameChain && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 mt-3">
            <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-indigo-600">Same network on both sides — this will send USDC same-chain.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Recipient */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                Recipient on {destinationChainName}
              </label>
              {address && (
                <button
                  type="button"
                  onClick={() => { setRecipient(address); setErrors((p) => ({ ...p, recipient: undefined })) }}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Use my address
                </button>
              )}
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => { setRecipient(e.target.value); setErrors((p) => ({ ...p, recipient: undefined })) }}
              placeholder="0x0000...0000"
              disabled={isPending}
              className="w-full bg-white border border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm font-mono text-gray-900 placeholder-gray-300 outline-none transition-all disabled:opacity-40"
            />
            {errors.recipient && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.recipient}
              </p>
            )}
          </div>

          {/* Route summary */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Route</span>
              <span className="text-xs font-medium text-gray-700">{isSameChain ? 'Direct transfer' : 'Circle CCTP'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Estimated time</span>
              <span className="text-xs font-medium text-gray-700">{isSameChain ? '~10 sec' : '~1–3 min'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Bridge fee</span>
              <span className="text-xs font-medium text-emerald-600">Free — network gas only</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !isSupportedChain}
            className="btn-gradient w-full text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-indigo-500/15"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : isSameChain ? (
              'Send USDC'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Bridge to {destinationChainName}
              </span>
            )}
          </button>
        </form>

        {!isSupportedChain && isConnected && (
          <p className="text-xs text-gray-400 text-center mt-3">Switch to a supported chain above to continue.</p>
        )}

        <div className="flex items-center justify-center pt-3">
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
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

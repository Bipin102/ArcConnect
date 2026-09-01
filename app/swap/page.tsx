'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { formatUnits } from 'viem'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { StatsSidebar } from '@/components/StatsSidebar'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { SwapStatusCard } from '@/components/SwapStatusCard'
import { useUsdcBalance } from '@/hooks/useUsdcBalance'
import { useErc20Balance } from '@/hooks/useErc20Balance'
import { useSwap, type SwapToken } from '@/hooks/useSwap'
import { useSwapEstimate } from '@/hooks/useSwapEstimate'
import { ARC_CHAIN_ID, ARC_EURC_ADDRESS, ERC20_EURC_DECIMALS, ERC20_USDC_DECIMALS } from '@/lib/constants'

const TOKEN_STYLES: Record<SwapToken, { bg: string; ring: string; symbol: string }> = {
  USDC: { bg: 'linear-gradient(135deg,#6d8dfd,#2563eb)', ring: 'rgba(37,99,235,0.35)', symbol: '$' },
  EURC: { bg: 'linear-gradient(135deg,#f4c352,#d4a017)', ring: 'rgba(212,160,23,0.35)', symbol: '€' },
}

function TokenBadge({ token, size = 26 }: { token: SwapToken; size?: number }) {
  const style = TOKEN_STYLES[token]
  return (
    <span
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: style.bg, boxShadow: `0 0 0 2px var(--card-surface), 0 0 0 3px ${style.ring}`, fontSize: size * 0.45 }}
    >
      {style.symbol}
    </span>
  )
}

export default function SwapPage() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { swap, status, reset } = useSwap()

  const [payToken, setPayToken] = useState<SwapToken>('USDC')
  const receiveToken: SwapToken = payToken === 'USDC' ? 'EURC' : 'USDC'
  const [amountIn, setAmountIn] = useState('')
  const [error, setError] = useState<string | undefined>()

  const usdc = useUsdcBalance(address, ARC_CHAIN_ID)
  const eurc = useErc20Balance(address, ARC_CHAIN_ID, ARC_EURC_ADDRESS, ERC20_EURC_DECIMALS)
  const payBalance = payToken === 'USDC' ? usdc : eurc
  const receiveBalance = payToken === 'USDC' ? eurc : usdc
  const payDecimals = payToken === 'USDC' ? ERC20_USDC_DECIMALS : ERC20_EURC_DECIMALS

  const { estimatedOutput, isLoading: isQuoting, error: quoteError } = useSwapEstimate(payToken, receiveToken, amountIn)

  const isOnArc = chainId === ARC_CHAIN_ID
  const isPending = status.state === 'pending'

  useEffect(() => {
    if (status.state === 'success' || status.state === 'error') {
      usdc.refetch()
      eurc.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.state])

  function handleReverse() {
    setPayToken(receiveToken)
    setAmountIn('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amountIn)
    if (!amountIn || Number.isNaN(parsed) || parsed <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    setError(undefined)
    await swap(payToken, receiveToken, amountIn)
  }

  return (
    <div className="bg-mesh min-h-screen">
      <SiteNav active="swap" />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
          <StatsSidebar className="w-full lg:sticky lg:top-24 order-2 lg:order-1" />

          <div className="flex justify-center order-1 lg:order-2">
            <div className="max-w-md w-full">
              <div className="px-1 mb-5">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Swap USDC ⇄ EURC</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Native swap on Arc Testnet · powered by Circle</p>
              </div>

              {!isConnected ? (
                <ConnectPrompt subtitle="Choose your wallet to swap on Arc." />
              ) : !isOnArc ? (
                <div className="widget-card rounded-3xl p-4 border border-amber-200 dark:border-amber-400/25">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Swap is Arc-only</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">USDC/EURC swap only runs on Arc Testnet. Switch your wallet to continue.</p>
                      <button
                        onClick={() => switchChain({ chainId: ARC_CHAIN_ID })}
                        disabled={isSwitching}
                        className="text-xs bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/25 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Switch to Arc Testnet
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 fade-in">
                  <div className="widget-card rounded-3xl p-4">
                    <div className="flex items-center justify-between px-1.5 pb-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Swap</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-full">
                        Circle Native Swap
                      </span>
                    </div>

                    <div className="relative space-y-1">
                      {/* You pay */}
                      <div className="slot-card rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">You pay</span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            Balance: {payBalance.isLoading ? '—' : payBalance.formatted}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-2 pr-2.5 py-2 shadow-sm">
                            <TokenBadge token={payToken} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{payToken}</span>
                          </div>
                          <input
                            type="number"
                            value={amountIn}
                            onChange={(e) => { setAmountIn(e.target.value); setError(undefined) }}
                            placeholder="0.00"
                            min="0"
                            step="0.000001"
                            disabled={isPending}
                            className="flex-1 min-w-0 bg-transparent text-right text-2xl font-semibold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none disabled:opacity-40"
                          />
                        </div>
                        {payBalance.raw > 0n && (
                          <div className="flex justify-end mt-1.5">
                            <button
                              type="button"
                              onClick={() => setAmountIn(formatUnits(payBalance.raw, payDecimals))}
                              disabled={isPending}
                              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-40"
                            >
                              Max
                            </button>
                          </div>
                        )}
                        {error && (
                          <p className="text-red-500 dark:text-red-400 text-xs mt-2">{error}</p>
                        )}
                      </div>

                      {/* Reverse */}
                      <div className="flex justify-center relative h-0">
                        <button
                          type="button"
                          onClick={handleReverse}
                          disabled={isPending}
                          aria-label="Reverse direction"
                          title="Reverse direction"
                          className="swap-divider absolute -top-4 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                      </div>

                      {/* You receive */}
                      <div className="slot-card rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">You receive (est.)</span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            Balance: {receiveBalance.isLoading ? '—' : receiveBalance.formatted}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-2 pr-2.5 py-2 shadow-sm">
                            <TokenBadge token={receiveToken} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{receiveToken}</span>
                          </div>
                          <span className="flex-1 min-w-0 text-right text-2xl font-semibold text-gray-300 dark:text-gray-600 truncate">
                            {isQuoting ? (
                              <span className="shimmer inline-block w-20 h-6 rounded align-middle" />
                            ) : (
                              estimatedOutput ?? '0.00'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 dark:text-gray-500">Route</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Circle Native Swap</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 dark:text-gray-500">Max slippage</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">3%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 dark:text-gray-500">Fee</span>
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Network gas only</span>
                        </div>
                        {quoteError && (
                          <p className="text-xs text-red-500 dark:text-red-400 pt-1">{quoteError}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="btn-gradient w-full text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Swapping...
                          </span>
                        ) : (
                          `Swap ${payToken} for ${receiveToken}`
                        )}
                      </button>
                    </form>

                    <div className="flex items-center justify-center pt-3">
                      <a
                        href="https://faucet.circle.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Need testnet USDC or EURC? Visit faucet.circle.com
                      </a>
                    </div>
                  </div>

                  <SwapStatusCard status={status} onReset={reset} />
                </div>
              )}
            </div>
          </div>
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}

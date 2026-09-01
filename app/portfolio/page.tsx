'use client'

import { useAccount } from 'wagmi'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { StatsSidebar } from '@/components/StatsSidebar'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { ChainIcon } from '@/components/ChainIcon'
import { usePortfolio } from '@/hooks/usePortfolio'
import { formatUsdcBalance } from '@/lib/utils'
import { CHAIN_NAMES, NATIVE_GAS_SYMBOLS } from '@/lib/constants'

export default function PortfolioPage() {
  const { address, isConnected } = useAccount()
  const balances = usePortfolio(address)

  const isLoading = balances.some((b) => b.usdc.isLoading || b.gas.isLoading)
  const totalUsdc = balances.reduce((sum, b) => sum + b.usdc.raw, 0n)
  const chainsWithFunds = balances.filter((b) => b.usdc.raw > 0n || b.gas.raw > 0n).length

  return (
    <div className="bg-mesh min-h-screen">
      <SiteNav active="portfolio" />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
          <StatsSidebar className="w-full lg:sticky lg:top-24 order-2 lg:order-1" />

          <div className="flex justify-center order-1 lg:order-2">
            <div className="max-w-md w-full">
              <div className="px-1 mb-5">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Portfolio</h1>
                <p className="text-xs text-gray-500 mt-1">Live balances across every supported chain</p>
              </div>

              {!isConnected ? (
                <ConnectPrompt subtitle="Choose your wallet to view your portfolio." />
              ) : (
                <div className="space-y-3 fade-in">
                  <div className="widget-card rounded-3xl p-6">
                    <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">
                      Total USDC · {chainsWithFunds} of {balances.length} chains funded
                    </span>
                    <p className="text-4xl font-bold text-gray-900 tracking-tight mt-2 tabular-nums">
                      {isLoading && totalUsdc === 0n ? (
                        <span className="shimmer inline-block w-40 h-9 rounded align-middle" />
                      ) : (
                        formatUsdcBalance(totalUsdc)
                      )}
                      <span className="text-lg font-semibold text-gray-400 ml-1.5">USDC</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Testnet tokens — combined ERC-20 USDC balance, summed across chains at face value.
                    </p>
                  </div>

                  <div className="widget-card rounded-3xl p-2">
                    {balances.map(({ chainId, usdc, gas }) => (
                      <div
                        key={chainId}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-gray-900/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ChainIcon chainId={chainId} size={30} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{CHAIN_NAMES[chainId]}</p>
                            <p className="text-[11px] text-gray-400">
                              Gas: {gas.isLoading ? '—' : gas.formatted} {NATIVE_GAS_SYMBOLS[chainId] ?? ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold font-mono text-gray-900 tabular-nums">
                            {usdc.isLoading ? '—' : usdc.formatted}
                          </p>
                          <p className="text-[11px] text-gray-400">USDC</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-400 text-center px-2">
                    Balances refresh automatically every 10 seconds.
                  </p>
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

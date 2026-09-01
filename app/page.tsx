'use client'

import Image from 'next/image'
import { ConnectButton } from '@/components/ConnectButton'
import { NetworkGuard } from '@/components/NetworkGuard'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { PaymentForm } from '@/components/PaymentForm'
import { StatsSidebar } from '@/components/StatsSidebar'
import { CreditChip } from '@/components/CreditChip'

export default function Home() {
  return (
    <div className="bg-mesh min-h-screen">
      {/* Top nav */}
      <nav className="border-b border-gray-100 glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/arcconnect-logo.png"
              alt="ArcConnect"
              width={30}
              height={30}
              className="rounded-lg shadow-sm"
            />
            <span className="font-semibold text-gray-900 tracking-tight">ArcConnect</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100/80 pl-2 pr-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 pulse-dot" />
              Testnet
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
            <a href="#bridge" className="text-gray-900 font-medium px-3 py-1.5 rounded-lg bg-gray-900/[0.04]">Bridge</a>
            <a href="https://docs.arc.io" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-900/[0.04] transition-colors">Docs</a>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg hover:text-gray-900 hover:bg-gray-900/[0.04] transition-colors">Explorer</a>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
          <StatsSidebar className="w-full lg:sticky lg:top-24 order-2 lg:order-1" />

          <div className="flex justify-center order-1 lg:order-2">
            <div id="bridge" className="max-w-md w-full scroll-mt-24">
              {/* Compact heading */}
              <div className="flex items-center justify-between px-1 mb-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bridge USDC to Arc</h1>
                  <p className="text-xs text-gray-500 mt-1">Settled via Circle CCTP · testnet only</p>
                </div>
              </div>

              <NetworkGuard />
              <BalanceDisplay />
              <PaymentForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-14 pt-6 border-t border-gray-900/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Gas token is USDC, not ETH ·{' '}
            <a
              href="https://docs.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors"
            >
              docs.arc.io
            </a>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 mr-0.5">Built by</span>
            <CreditChip name="Bipin" handle="Bipin_xyz" initial="B" gradient="from-indigo-500 to-blue-500" />
            <CreditChip name="ArcConnect" handle="ArcConnect_" initial="A" gradient="from-violet-500 to-indigo-600" />
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { ConnectButton } from '@/components/ConnectButton'
import { NetworkGuard } from '@/components/NetworkGuard'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { PaymentForm } from '@/components/PaymentForm'
import { StatsSidebar } from '@/components/StatsSidebar'

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
        <div className="mt-14 pt-6 border-t border-gray-900/[0.06] flex items-center justify-between">
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
          <a
            href="https://x.com/ArcConnect_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-indigo-600 transition-colors text-xs flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @ArcConnect_
          </a>
        </div>
      </main>
    </div>
  )
}

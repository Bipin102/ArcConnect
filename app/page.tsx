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
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/arcconnect-logo.png"
              alt="ArcConnect"
              width={30}
              height={30}
              className="rounded-lg"
            />
            <span className="font-semibold text-gray-900 tracking-tight">ArcConnect</span>
            <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              Testnet
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
            <a href="#bridge" className="text-gray-900 font-medium">Bridge</a>
            <a href="https://docs.arc.io" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition-colors">Docs</a>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800 transition-colors">Explorer</a>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row lg:items-start justify-center gap-8">
          <StatsSidebar className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 order-2 lg:order-1" />

          <div id="bridge" className="max-w-md w-full mx-auto lg:mx-0 scroll-mt-24 order-1 lg:order-2">
            {/* Compact heading */}
            <div className="flex items-center justify-between px-1 mb-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Bridge USDC to Arc</h1>
                <p className="text-xs text-gray-500 mt-0.5">Settled via Circle CCTP · testnet only</p>
              </div>
            </div>

            <NetworkGuard />
            <BalanceDisplay />
            <PaymentForm />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Gas token is USDC, not ETH ·{' '}
            <a
              href="https://docs.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              docs.arc.io
            </a>
          </p>
          <a
            href="https://x.com/ArcConnect_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-800 transition-colors text-xs flex-shrink-0"
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

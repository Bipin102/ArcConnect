'use client'

import Image from 'next/image'
import { ConnectButton } from '@/components/ConnectButton'
import { NetworkGuard } from '@/components/NetworkGuard'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { PaymentForm } from '@/components/PaymentForm'

const CHAINS = ['Ethereum Sepolia', 'Base Sepolia', 'Arbitrum Sepolia', 'Avalanche Fuji', 'Arc Testnet']

export default function Home() {
  return (
    <div className="bg-mesh min-h-screen">
      {/* Top nav */}
      <nav className="border-b border-white/5 glass sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/arcconnect-logo.png"
              alt="ArcConnect"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-white tracking-tight">ArcConnect</span>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Testnet
            </span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl" />
              <Image
                src="/arcconnect-logo.png"
                alt="ArcConnect"
                width={88}
                height={88}
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            One-Click{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Cross-Chain
            </span>{' '}
            Pay
          </h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Send USDC from any chain to Arc Testnet in a single transaction. Powered by Circle App Kit.
          </p>

          {/* Chain pills */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-5">
            {CHAINS.map((name) => (
              <span
                key={name}
                className="text-xs text-gray-500 bg-white/5 border border-white/8 px-2.5 py-1 rounded-full"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Guards + form */}
        <NetworkGuard />
        <BalanceDisplay />
        <PaymentForm />

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Gas token is USDC, not ETH ·{' '}
            <a
              href="https://docs.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors"
            >
              docs.arc.io
            </a>
          </p>
          <a
            href="https://x.com/ArcConnect_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-600 hover:text-white transition-colors text-xs"
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

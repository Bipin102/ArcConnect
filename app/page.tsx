'use client'

import Image from 'next/image'
import { ConnectButton } from '@/components/ConnectButton'
import { NetworkGuard } from '@/components/NetworkGuard'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { PaymentForm } from '@/components/PaymentForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12">
      {/* Header */}
      <div className="max-w-lg mx-auto mb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/arcconnect-logo.png"
              alt="ArcConnect logo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-xl font-bold text-white">ArcConnect</h1>
              <p className="text-xs text-gray-500 mt-0.5">Arc Testnet</p>
            </div>
          </div>
          <ConnectButton />
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/arcconnect-logo.png"
              alt="ArcConnect"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg shadow-blue-900/30"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">One-Click Cross-Chain Pay</h2>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Send USDC from any testnet chain directly to any Arc Testnet address. Powered by Circle
            App Kit.
          </p>
        </div>

        {/* Supported chains badge */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-8">
          {['Ethereum Sepolia', 'Base Sepolia', 'Arbitrum Sepolia', 'Avalanche Fuji', 'Arc Testnet'].map(
            (name) => (
              <span
                key={name}
                className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full border border-gray-700"
              >
                {name}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Network guard (shows if on wrong chain) */}
      <NetworkGuard />

      {/* Arc balances */}
      <BalanceDisplay />

      {/* Payment form */}
      <PaymentForm />

      {/* Footer / Contact */}
      <div className="max-w-lg mx-auto mt-12 pt-6 border-t border-gray-800 flex items-center justify-between">
        <p className="text-gray-700 text-xs">
          Testnet only · Gas token is USDC, not ETH ·{' '}
          <a
            href="https://docs.arc.io"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-500"
          >
            docs.arc.io
          </a>
        </p>
        <a
          href="https://x.com/ArcConnect_"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          @ArcConnect_
        </a>
      </div>
    </main>
  )
}

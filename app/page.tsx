'use client'

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
          <div>
            <h1 className="text-xl font-bold text-white">USDC Pay</h1>
            <p className="text-xs text-gray-500 mt-0.5">Arc Testnet</p>
          </div>
          <ConnectButton />
        </div>

        <div className="text-center mb-8">
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

      {/* Footer */}
      <p className="text-center text-gray-700 text-xs mt-12">
        Testnet only. Gas token is USDC, not ETH.{' '}
        <a
          href="https://docs.arc.io"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-500"
        >
          docs.arc.io
        </a>
      </p>
    </main>
  )
}

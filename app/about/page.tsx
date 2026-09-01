'use client'

import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { ARC_CHAIN_ID, ARC_RPC_URL, ARC_EXPLORER_URL, ARC_FAUCET_URL } from '@/lib/constants'

const STEPS = [
  {
    n: '01',
    title: 'Connect a wallet',
    body: 'MetaMask or any injected wallet on desktop; WalletConnect opens your mobile wallet app if there’s no browser extension.',
  },
  {
    n: '02',
    title: 'Get testnet funds',
    body: 'Grab USDC (and native gas on non-Arc chains) from the official Circle faucet before your first transfer.',
  },
  {
    n: '03',
    title: 'Bridge, swap, or track',
    body: 'Move USDC into Arc from five testnets, swap USDC ⇄ EURC natively on Arc, or check balances across every chain in one view.',
  },
]

const SPECS: { label: string; value: string; href?: string }[] = [
  { label: 'Network name', value: 'Arc Testnet' },
  { label: 'Chain ID', value: String(ARC_CHAIN_ID) },
  { label: 'Native gas token', value: 'USDC (18 decimals)' },
  { label: 'ERC-20 USDC', value: '6 decimals' },
  { label: 'RPC endpoint', value: ARC_RPC_URL, href: ARC_RPC_URL },
  { label: 'Block explorer', value: 'testnet.arcscan.app', href: ARC_EXPLORER_URL },
]

const FEATURES = [
  {
    href: '/',
    title: 'Bridge',
    body: 'Move USDC into Arc from Ethereum, Base, Arbitrum, or Avalanche testnets via Circle’s CCTP — or send same-chain once you’re already on Arc.',
  },
  {
    href: '/swap',
    title: 'Swap',
    body: 'Native USDC ⇄ EURC swap on Arc Testnet, priced with a live quote from Circle’s swap API — not a flat 1:1 assumption.',
  },
  {
    href: '/portfolio',
    title: 'Portfolio',
    body: 'One view of your USDC and gas balances across every supported chain, refreshing automatically.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-mesh min-h-screen">
      <SiteNav active="about" />

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-400/20 px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 pulse-dot" />
            About ArcConnect
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
            USDC, moving on Arc — bridge, swap, or hold
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            ArcConnect is a small, focused toolkit for Arc Testnet: get USDC in from other chains, swap it for EURC
            natively, and see where your funds actually sit. No points, no fake yield — every number on this site is
            read directly from a chain or from Circle&apos;s own APIs.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5 text-center">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((step) => (
              <div key={step.n} className="widget-card rounded-2xl p-5">
                <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">{step.n}</span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-2 mb-1.5">{step.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature grid */}
        <section className="mb-16">
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5 text-center">What you can do here</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="widget-card rounded-2xl p-5 flex flex-col hover:-translate-y-0.5 transition-transform"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{f.body}</p>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-3 flex items-center gap-1">
                  Open
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Protocol specs */}
        <section>
          <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-5 text-center">Built on Arc Testnet</h2>
          <div className="widget-card rounded-2xl overflow-hidden">
            {SPECS.map((spec, i) => (
              <div
                key={spec.label}
                className={`flex items-center justify-between px-5 py-3.5 ${i !== SPECS.length - 1 ? 'border-b border-gray-100 dark:border-white/10' : ''}`}
              >
                <span className="text-xs text-gray-400 dark:text-gray-500">{spec.label}</span>
                {spec.href ? (
                  <a
                    href={spec.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    {spec.value}
                  </a>
                ) : (
                  <span className="text-sm font-mono text-gray-900 dark:text-white">{spec.value}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            Arc is designed around sub-second deterministic finality, with gas paid in USDC instead of a separate
            token. Need funds? Visit the{' '}
            <a href={ARC_FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              official Circle faucet
            </a>
            .
          </p>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}

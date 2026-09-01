'use client'

import { NetworkGuard } from '@/components/NetworkGuard'
import { BalanceDisplay } from '@/components/BalanceDisplay'
import { PaymentForm } from '@/components/PaymentForm'
import { StatsSidebar } from '@/components/StatsSidebar'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'

export default function BridgePage() {
  return (
    <div className="bg-mesh min-h-screen">
      <SiteNav active="bridge" />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
          <StatsSidebar className="w-full lg:sticky lg:top-24 order-2 lg:order-1" />

          <div className="flex justify-center order-1 lg:order-2">
            <div className="max-w-md w-full">
              {/* Compact heading */}
              <div className="flex items-center justify-between px-1 mb-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Bridge USDC to Arc</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Settled via Circle CCTP · testnet only</p>
                </div>
              </div>

              <NetworkGuard />
              <BalanceDisplay />
              <PaymentForm />
            </div>
          </div>
        </div>

        <SiteFooter />
      </main>
    </div>
  )
}

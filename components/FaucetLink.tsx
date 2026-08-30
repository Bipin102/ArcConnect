'use client'

import { ARC_FAUCET_URL } from '@/lib/constants'

export function FaucetLink() {
  return (
    <a
      href={ARC_FAUCET_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
    >
      Get testnet USDC at faucet.circle.com
    </a>
  )
}

'use client'

import { shortenAddress } from '@/lib/utils'

interface ExplorerLinkProps {
  txHash: string
  explorerUrl: string
}

export function ExplorerLink({ txHash, explorerUrl }: ExplorerLinkProps) {
  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2 transition-colors"
    >
      View on Arcscan: {shortenAddress(txHash)}
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  )
}

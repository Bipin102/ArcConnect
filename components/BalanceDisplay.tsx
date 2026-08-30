'use client'

import { useAccount } from 'wagmi'
import { useUsdcBalance } from '@/hooks/useUsdcBalance'
import { useArcBalance } from '@/hooks/useArcBalance'
import { ARC_FAUCET_URL } from '@/lib/constants'

export function BalanceDisplay() {
  const { address, isConnected } = useAccount()
  const usdc = useUsdcBalance(address)
  const gas = useArcBalance(address)

  if (!isConnected) return null

  const hasGas = gas.raw > 0n
  const hasUsdc = usdc.raw > 0n

  return (
    <div className="w-full max-w-lg mx-auto mb-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-2">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
        Arc Testnet Balances
      </p>

      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Gas USDC (native, 18 dec)</span>
        <span className={`font-mono ${hasGas ? 'text-green-400' : 'text-red-400'}`}>
          {gas.isLoading ? '...' : `${gas.formatted} USDC`}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-400">ERC-20 USDC (6 dec)</span>
        <span className={`font-mono ${hasUsdc ? 'text-green-400' : 'text-gray-500'}`}>
          {usdc.isLoading ? '...' : `${usdc.formatted} USDC`}
        </span>
      </div>

      {!hasGas && (
        <p className="text-xs text-yellow-400 pt-1">
          No gas USDC on Arc Testnet.{' '}
          <a
            href={ARC_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-300"
          >
            Get testnet USDC from faucet
          </a>
        </p>
      )}
    </div>
  )
}

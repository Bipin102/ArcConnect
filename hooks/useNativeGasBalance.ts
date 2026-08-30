'use client'

import { useBalance } from 'wagmi'
import { formatUnits } from 'viem'

// Read the native gas balance (ETH/AVAX/USDC depending on chain) for a given chain.
// This is separate from ERC-20 USDC — most chains here need their own native
// token to pay gas, distinct from any USDC balance.
export function useNativeGasBalance(address?: `0x${string}`, chainId?: number) {
  const { data, isLoading, refetch } = useBalance({
    address,
    chainId,
    query: { enabled: !!address && !!chainId, refetchInterval: 10_000 },
  })

  const raw = data?.value ?? 0n
  const formatted =
    data?.value !== undefined
      ? parseFloat(formatUnits(data.value, data.decimals)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 5,
        })
      : '—'

  return { raw, formatted, isLoading, refetch }
}

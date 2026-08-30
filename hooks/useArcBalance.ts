'use client'

import { useBalance } from 'wagmi'
import { formatNativeUsdcBalance } from '@/lib/utils'
import { ARC_CHAIN_ID } from '@/lib/constants'

// Read native gas USDC balance on Arc Testnet (18 decimals)
export function useArcBalance(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useBalance({
    address,
    chainId: ARC_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 10_000 },
  })

  return {
    raw: data?.value ?? 0n,
    formatted: data?.value !== undefined ? formatNativeUsdcBalance(data.value) : '—',
    isLoading,
    refetch,
  }
}

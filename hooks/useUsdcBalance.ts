'use client'

import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { USDC_ADDRESSES } from '@/lib/constants'
import { formatUsdcBalance } from '@/lib/utils'

// Read ERC-20 USDC balance for a given address on a given chain (6 decimals)
export function useUsdcBalance(address?: `0x${string}`, chainId?: number) {
  const tokenAddress = chainId ? USDC_ADDRESSES[chainId] : undefined

  const { data: raw, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenAddress },
    chainId,
  })

  return {
    raw: raw ?? 0n,
    formatted: raw !== undefined ? formatUsdcBalance(raw) : '—',
    isLoading,
    refetch,
  }
}

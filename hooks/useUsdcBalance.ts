'use client'

import { useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { ARC_USDC_ADDRESS } from '@/lib/constants'
import { formatUsdcBalance } from '@/lib/utils'

// Read ERC-20 USDC balance on Arc Testnet (6 decimals)
export function useUsdcBalance(address?: `0x${string}`) {
  const { data: raw, isLoading, refetch } = useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    chainId: 5042002,
  })

  return {
    raw: raw ?? 0n,
    formatted: raw !== undefined ? formatUsdcBalance(raw) : '—',
    isLoading,
    refetch,
  }
}

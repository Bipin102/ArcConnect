'use client'

import { useReadContract } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'

// Read any ERC-20 balance on a given chain. Used for tokens (like EURC) that
// only need one chain, unlike useUsdcBalance which covers all 5.
export function useErc20Balance(
  address?: `0x${string}`,
  chainId?: number,
  tokenAddress?: `0x${string}`,
  decimals = 6,
) {
  const { data: raw, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenAddress && !!chainId, refetchInterval: 10_000 },
    chainId,
  })

  const formatted =
    raw !== undefined
      ? parseFloat(formatUnits(raw, decimals)).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })
      : '—'

  return { raw: raw ?? 0n, formatted, isLoading, refetch }
}

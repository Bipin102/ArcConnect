'use client'

import { useUsdcBalance } from './useUsdcBalance'
import { useNativeGasBalance } from './useNativeGasBalance'
import { ARC_CHAIN_ID, SUPPORTED_SOURCE_CHAIN_IDS } from '@/lib/constants'

export interface PortfolioChainBalance {
  chainId: number
  usdc: ReturnType<typeof useUsdcBalance>
  gas: ReturnType<typeof useNativeGasBalance>
}

// Live USDC + native-gas balances across every supported chain for one
// address. The chain list is a fixed, compile-time constant (5 chains), so
// calling the underlying hooks once per chain — rather than in a loop — is
// what keeps this rules-of-hooks safe.
export function usePortfolio(address?: `0x${string}`): PortfolioChainBalance[] {
  const [sepolia, base, arbitrum, fuji] = SUPPORTED_SOURCE_CHAIN_IDS

  const arcUsdc = useUsdcBalance(address, ARC_CHAIN_ID)
  const arcGas = useNativeGasBalance(address, ARC_CHAIN_ID)

  const sepoliaUsdc = useUsdcBalance(address, sepolia)
  const sepoliaGas = useNativeGasBalance(address, sepolia)

  const baseUsdc = useUsdcBalance(address, base)
  const baseGas = useNativeGasBalance(address, base)

  const arbitrumUsdc = useUsdcBalance(address, arbitrum)
  const arbitrumGas = useNativeGasBalance(address, arbitrum)

  const fujiUsdc = useUsdcBalance(address, fuji)
  const fujiGas = useNativeGasBalance(address, fuji)

  return [
    { chainId: ARC_CHAIN_ID, usdc: arcUsdc, gas: arcGas },
    { chainId: sepolia, usdc: sepoliaUsdc, gas: sepoliaGas },
    { chainId: base, usdc: baseUsdc, gas: baseGas },
    { chainId: arbitrum, usdc: arbitrumUsdc, gas: arbitrumGas },
    { chainId: fuji, usdc: fujiUsdc, gas: fujiGas },
  ]
}

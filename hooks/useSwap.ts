'use client'

import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { AppKit } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { ArcTestnet } from '@circle-fin/app-kit/chains'
import { buildExplorerTxUrl } from '@/lib/utils'
import { ARC_CHAIN_ID } from '@/lib/constants'

export type SwapToken = 'USDC' | 'EURC'

export type SwapStatus =
  | { state: 'idle' }
  | { state: 'pending'; message: string }
  | {
      state: 'success'
      txHash: string
      explorerUrl: string
      tokenIn: SwapToken
      tokenOut: SwapToken
      amountIn: string
      amountOut?: string
    }
  | { state: 'error'; message: string }

const kit = new AppKit()

// Arc Testnet is one of the few chains (mainnet or testnet) where Circle's
// App Kit swap route is live — restricted there to USDC, EURC, and cirBTC.
// See https://docs.arc.io/app-kit/references/supported-blockchains
export function useSwap() {
  const { connector, chainId } = useAccount()
  const [status, setStatus] = useState<SwapStatus>({ state: 'idle' })

  const swap = useCallback(
    async (tokenIn: SwapToken, tokenOut: SwapToken, amountIn: string) => {
      if (!connector) {
        setStatus({ state: 'error', message: 'Wallet not connected.' })
        return
      }
      if (chainId !== ARC_CHAIN_ID) {
        setStatus({ state: 'error', message: 'Switch your wallet to Arc Testnet to swap.' })
        return
      }

      try {
        setStatus({ state: 'pending', message: `Swapping ${tokenIn} for ${tokenOut}...` })

        const provider = await connector.getProvider()
        const adapter = await createViemAdapterFromProvider({
          provider: provider as Parameters<typeof createViemAdapterFromProvider>[0]['provider'],
          capabilities: {
            addressContext: 'user-controlled',
            supportedChains: [ArcTestnet],
          },
        })

        const result = await kit.swap({
          from: { adapter, chain: ArcTestnet },
          tokenIn,
          tokenOut,
          amountIn,
        })

        setStatus({
          state: 'success',
          txHash: result.txHash,
          explorerUrl: result.explorerUrl ?? buildExplorerTxUrl(result.txHash, ARC_CHAIN_ID),
          tokenIn,
          tokenOut,
          amountIn: result.amountIn,
          amountOut: result.amountOut,
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred.'
        setStatus({ state: 'error', message })
      }
    },
    [connector, chainId],
  )

  const reset = useCallback(() => setStatus({ state: 'idle' }), [])

  return { swap, status, reset }
}

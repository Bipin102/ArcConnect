'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { AppKit } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import { ArcTestnet } from '@circle-fin/app-kit/chains'
import type { SwapToken } from './useSwap'

const kit = new AppKit()

interface Quote {
  tokenIn: SwapToken
  tokenOut: SwapToken
  amountIn: string
  amountOut: string
}

// Live debounced quote for a USDC/EURC swap on Arc — the pair tracks the
// real EUR/USD rate, so a 1:1 assumption would be wrong. Only fires once the
// wallet is connected, since kit.estimateSwap() needs an adapter.
export function useSwapEstimate(tokenIn: SwapToken, tokenOut: SwapToken, amountIn: string) {
  const { connector, isConnected } = useAccount()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const amount = parseFloat(amountIn)
    if (!isConnected || !connector || !amountIn || Number.isNaN(amount) || amount <= 0) {
      return
    }

    const requestId = ++requestIdRef.current
    const timer = setTimeout(() => {
      setIsLoading(true)
      void (async () => {
        try {
          const provider = await connector.getProvider()
          const adapter = await createViemAdapterFromProvider({
            provider: provider as Parameters<typeof createViemAdapterFromProvider>[0]['provider'],
            capabilities: { addressContext: 'user-controlled', supportedChains: [ArcTestnet] },
          })
          const estimate = await kit.estimateSwap({
            from: { adapter, chain: ArcTestnet },
            tokenIn,
            tokenOut,
            amountIn,
          })
          if (requestIdRef.current === requestId) {
            setQuote({ tokenIn, tokenOut, amountIn, amountOut: estimate.estimatedOutput.amount })
            setError(null)
          }
        } catch (err) {
          if (requestIdRef.current === requestId) {
            setError(err instanceof Error ? err.message : 'Could not fetch a quote.')
          }
        } finally {
          if (requestIdRef.current === requestId) setIsLoading(false)
        }
      })()
    }, 500)

    return () => clearTimeout(timer)
  }, [tokenIn, tokenOut, amountIn, isConnected, connector])

  const isStale = !quote || quote.tokenIn !== tokenIn || quote.tokenOut !== tokenOut || quote.amountIn !== amountIn

  return {
    estimatedOutput: isStale ? null : quote?.amountOut ?? null,
    isLoading,
    error: isStale ? null : error,
  }
}

'use client'

import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { AppKit, BridgeChain, type BridgeResult } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import {
  ArcTestnet,
  EthereumSepolia,
  BaseSepolia,
  ArbitrumSepolia,
  AvalancheFuji,
} from '@circle-fin/app-kit/chains'
import { buildExplorerTxUrl } from '@/lib/utils'

export type PayStatus =
  | { state: 'idle' }
  | { state: 'pending'; message: string }
  | { state: 'success'; txHash: string; explorerUrl: string; amount: string; recipient: string }
  | { state: 'error'; message: string }

const SUPPORTED_SOURCE_CHAINS = [
  EthereumSepolia,
  BaseSepolia,
  ArbitrumSepolia,
  AvalancheFuji,
  ArcTestnet,
]

// Map wagmi chain ID to BridgeChain enum value
const CHAIN_ID_TO_BRIDGE_CHAIN: Record<number, BridgeChain> = {
  11155111: BridgeChain.Ethereum_Sepolia,
  84532: BridgeChain.Base_Sepolia,
  421614: BridgeChain.Arbitrum_Sepolia,
  43113: BridgeChain.Avalanche_Fuji,
  5042002: BridgeChain.Arc_Testnet,
}

// Extract the last successful tx hash from bridge result steps
function extractTxHash(result: BridgeResult): string {
  const successStep = [...result.steps].reverse().find((s) => s.txHash && s.state === 'success')
  return successStep?.txHash ?? ''
}

const kit = new AppKit()

export function usePay() {
  const { connector, chainId } = useAccount()
  const [status, setStatus] = useState<PayStatus>({ state: 'idle' })

  const pay = useCallback(
    async (recipient: string, amount: string) => {
      if (!connector || !chainId) {
        setStatus({ state: 'error', message: 'Wallet not connected.' })
        return
      }

      const sourceBridgeChain = CHAIN_ID_TO_BRIDGE_CHAIN[chainId]
      if (!sourceBridgeChain) {
        setStatus({
          state: 'error',
          message: `Chain ID ${chainId} is not supported as a payment source. Switch to Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, or Avalanche Fuji.`,
        })
        return
      }

      try {
        setStatus({ state: 'pending', message: 'Connecting to wallet...' })

        const provider = await connector.getProvider()
        const adapter = await createViemAdapterFromProvider({
          provider: provider as Parameters<typeof createViemAdapterFromProvider>[0]['provider'],
          capabilities: {
            addressContext: 'user-controlled',
            supportedChains: SUPPORTED_SOURCE_CHAINS,
          },
        })

        if (chainId === 5042002) {
          // Already on Arc Testnet — use send (same-chain)
          setStatus({ state: 'pending', message: 'Sending USDC on Arc Testnet...' })

          const result = await kit.send({
            from: { adapter, chain: BridgeChain.Arc_Testnet },
            to: recipient,
            amount,
            token: 'USDC',
          })

          const txHash = result?.txHash ?? ''
          setStatus({
            state: 'success',
            txHash,
            explorerUrl: buildExplorerTxUrl(txHash),
            amount,
            recipient,
          })
        } else {
          // Cross-chain bridge to Arc Testnet with recipient address
          setStatus({ state: 'pending', message: 'Waiting for wallet approval...' })

          const result = await kit.bridge({
            from: { adapter, chain: sourceBridgeChain },
            to: {
              adapter,
              chain: BridgeChain.Arc_Testnet,
              recipientAddress: recipient,
            },
            amount,
          })

          const txHash = extractTxHash(result)
          setStatus({
            state: 'success',
            txHash,
            explorerUrl: buildExplorerTxUrl(txHash),
            amount,
            recipient,
          })
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred.'
        setStatus({ state: 'error', message })
      }
    },
    [connector, chainId],
  )

  const reset = useCallback(() => setStatus({ state: 'idle' }), [])

  return { pay, status, reset }
}

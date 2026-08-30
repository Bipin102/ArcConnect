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
import { CHAIN_NAMES } from '@/lib/constants'

export type PayStatus =
  | { state: 'idle' }
  | { state: 'pending'; message: string }
  | { state: 'success'; txHash: string; explorerUrl: string; amount: string; recipient: string; destinationChainId: number }
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
    async (recipient: string, amount: string, destinationChainId: number) => {
      if (!connector || !chainId) {
        setStatus({ state: 'error', message: 'Wallet not connected.' })
        return
      }

      const sourceBridgeChain = CHAIN_ID_TO_BRIDGE_CHAIN[chainId]
      const destBridgeChain = CHAIN_ID_TO_BRIDGE_CHAIN[destinationChainId]
      if (!sourceBridgeChain) {
        setStatus({
          state: 'error',
          message: `Chain ID ${chainId} is not a supported network. Switch your wallet to a supported chain.`,
        })
        return
      }
      if (!destBridgeChain) {
        setStatus({ state: 'error', message: `Destination chain ID ${destinationChainId} is not supported.` })
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

        if (chainId === destinationChainId) {
          // Same chain on both sides — use send instead of bridge
          setStatus({ state: 'pending', message: `Sending USDC on ${CHAIN_NAMES[chainId] ?? 'chain'}...` })

          const result = await kit.send({
            from: { adapter, chain: sourceBridgeChain },
            to: recipient,
            amount,
            token: 'USDC',
          })

          const txHash = result?.txHash ?? ''
          setStatus({
            state: 'success',
            txHash,
            explorerUrl: buildExplorerTxUrl(txHash, destinationChainId),
            amount,
            recipient,
            destinationChainId,
          })
        } else {
          // Cross-chain bridge to the selected destination with recipient address
          setStatus({ state: 'pending', message: 'Waiting for wallet approval...' })

          const result = await kit.bridge({
            from: { adapter, chain: sourceBridgeChain },
            to: {
              adapter,
              chain: destBridgeChain,
              recipientAddress: recipient,
            },
            amount,
          })

          const txHash = extractTxHash(result)
          setStatus({
            state: 'success',
            txHash,
            explorerUrl: buildExplorerTxUrl(txHash, destinationChainId),
            amount,
            recipient,
            destinationChainId,
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

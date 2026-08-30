'use client'

import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { AppKit, BridgeChain, type BridgeResult, type BridgeStep } from '@circle-fin/app-kit'
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

// Narrow shape shared by CCTP v2 step events (approve/burn/fetchAttestation/mint)
type BridgeStepPayload = { values: { state: 'pending' | 'success' | 'error' | 'noop' } }

// Surface each CCTP leg as it happens so a required network switch + second
// signature (the mint step, on the destination chain) doesn't look like an
// unexplained extra transaction.
function attachBridgeProgressListeners(
  sourceChainName: string,
  destChainName: string,
  setMessage: (message: string) => void,
) {
  const onApprove = (payload: BridgeStepPayload) => {
    if (payload.values.state === 'pending') setMessage(`Approving USDC on ${sourceChainName}...`)
  }
  const onBurn = (payload: BridgeStepPayload) => {
    if (payload.values.state === 'pending') setMessage(`Burning USDC on ${sourceChainName}...`)
    if (payload.values.state === 'success') setMessage('Waiting for Circle attestation...')
  }
  const onFetchAttestation = (payload: BridgeStepPayload) => {
    if (payload.values.state === 'pending') setMessage('Waiting for Circle attestation...')
  }
  const onMint = (payload: BridgeStepPayload) => {
    if (payload.values.state === 'pending') {
      setMessage(
        sourceChainName === destChainName
          ? `Confirming the final step in your wallet to complete the transfer on ${destChainName}...`
          : `Switching to ${destChainName} — approve the final step in your wallet to complete the transfer...`,
      )
    }
  }

  kit.on('bridge.approve', onApprove)
  kit.on('bridge.burn', onBurn)
  kit.on('bridge.fetchAttestation', onFetchAttestation)
  kit.on('bridge.mint', onMint)

  return () => {
    kit.off('bridge.approve', onApprove)
    kit.off('bridge.burn', onBurn)
    kit.off('bridge.fetchAttestation', onFetchAttestation)
    kit.off('bridge.mint', onMint)
  }
}

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
          // Same chain on both sides. Circle's SDK still routes USDC "send"
          // through the same CCTP machinery under the hood (burn then mint on
          // the same chain), so this can still prompt for a second signature
          // partway through — surface that instead of leaving it unexplained.
          const chainName = CHAIN_NAMES[chainId] ?? 'chain'
          setStatus({ state: 'pending', message: `Sending USDC on ${chainName}...` })

          const detachListeners = attachBridgeProgressListeners(chainName, chainName, (message) =>
            setStatus({ state: 'pending', message }),
          )

          let result: BridgeStep
          try {
            result = await kit.send({
              from: { adapter, chain: sourceBridgeChain },
              to: recipient,
              amount,
              token: 'USDC',
            })
          } finally {
            detachListeners()
          }

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
          // Cross-chain bridge to the selected destination with recipient address.
          // CCTP is two legs — burn on the source chain, then mint on the
          // destination — so the wallet will switch networks and ask for a
          // second signature partway through. That's expected, not a glitch.
          setStatus({ state: 'pending', message: 'Waiting for wallet approval...' })

          const detachListeners = attachBridgeProgressListeners(
            CHAIN_NAMES[chainId] ?? 'source chain',
            CHAIN_NAMES[destinationChainId] ?? 'destination chain',
            (message) => setStatus({ state: 'pending', message }),
          )

          let result: BridgeResult
          try {
            result = await kit.bridge({
              from: { adapter, chain: sourceBridgeChain },
              to: {
                adapter,
                chain: destBridgeChain,
                recipientAddress: recipient,
              },
              amount,
            })
          } finally {
            detachListeners()
          }

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

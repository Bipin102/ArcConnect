'use client'

import { useState, useCallback } from 'react'
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi'
import { parseUnits } from 'viem'
import { ARC_CHAIN_ID, ARC_CONNECT_RECEIPTS_ADDRESS, ERC20_USDC_DECIMALS, CCTP_DOMAINS } from '@/lib/constants'
import { ARC_CONNECT_RECEIPTS_ABI } from '@/lib/arcConnectReceiptsAbi'
import { buildExplorerTxUrl } from '@/lib/utils'

export type RecordReceiptStatus =
  | { state: 'idle' }
  | { state: 'pending'; message: string }
  | { state: 'success'; txHash: string; explorerUrl: string }
  | { state: 'error'; message: string }

interface RecordReceiptParams {
  recipient: `0x${string}`
  amount: string
  sourceChainId: number
  refTxHash: string
}

// Records an on-chain receipt for an already-settled payment via
// ArcConnectReceipts (Arc Testnet only). Purely additive/optional — never
// fired automatically, since it needs its own signature and Arc gas on top
// of the transfer that already happened.
export function useRecordReceipt() {
  const { chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()
  const [status, setStatus] = useState<RecordReceiptStatus>({ state: 'idle' })

  const recordReceipt = useCallback(
    async ({ recipient, amount, sourceChainId, refTxHash }: RecordReceiptParams) => {
      if (!refTxHash || refTxHash.length !== 66) {
        setStatus({ state: 'error', message: 'No settlement transaction hash to reference.' })
        return
      }

      try {
        if (chainId !== ARC_CHAIN_ID) {
          setStatus({ state: 'pending', message: 'Switching to Arc Testnet to record the receipt...' })
          await switchChainAsync({ chainId: ARC_CHAIN_ID })
        }

        setStatus({ state: 'pending', message: 'Confirm in your wallet to record the receipt on Arc...' })

        const amountUnits = parseUnits(amount, ERC20_USDC_DECIMALS)
        const sourceDomain = CCTP_DOMAINS[sourceChainId] ?? 0

        const txHash = await writeContractAsync({
          address: ARC_CONNECT_RECEIPTS_ADDRESS,
          abi: ARC_CONNECT_RECEIPTS_ABI,
          functionName: 'recordPayment',
          args: [recipient, amountUnits, sourceDomain, refTxHash as `0x${string}`],
          chainId: ARC_CHAIN_ID,
        })

        setStatus({ state: 'success', txHash, explorerUrl: buildExplorerTxUrl(txHash, ARC_CHAIN_ID) })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred.'
        setStatus({
          state: 'error',
          message: message.includes('ReferenceAlreadyRecorded')
            ? 'A receipt for this payment is already recorded.'
            : message,
        })
      }
    },
    [chainId, switchChainAsync, writeContractAsync],
  )

  const reset = useCallback(() => setStatus({ state: 'idle' }), [])

  return { recordReceipt, status, reset }
}

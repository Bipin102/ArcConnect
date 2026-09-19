import { defineChain } from 'viem'
import { ARC_CHAIN_ID, ARC_RPC_URL, ARC_EXPLORER_URL } from './constants'
import { ACTIVE_ARC_CONFIG } from './networks'

// Arc chain definition for Viem/Wagmi — follows the active network from
// lib/networks.ts (testnet today; mainnet once it exists and is verified).
// Verify values at: https://docs.arc.io/arc/references/connect-to-arc
export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: ACTIVE_ARC_CONFIG.label,
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18, // Native gas USDC uses 18 decimals
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
      webSocket: [ACTIVE_ARC_CONFIG.wsRpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: ACTIVE_ARC_CONFIG.explorerName,
      url: ARC_EXPLORER_URL,
    },
  },
  testnet: ACTIVE_ARC_CONFIG.key !== 'mainnet',
})

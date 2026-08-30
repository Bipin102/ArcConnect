import { defineChain } from 'viem'
import { ARC_CHAIN_ID, ARC_RPC_URL, ARC_EXPLORER_URL } from './constants'

// Arc Testnet chain definition for Viem/Wagmi
// Verify values at: https://docs.arc.io/arc/references/connect-to-arc
export const arcTestnet = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18, // Native gas USDC uses 18 decimals
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
      webSocket: ['wss://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan',
      url: ARC_EXPLORER_URL,
    },
  },
  testnet: true,
})

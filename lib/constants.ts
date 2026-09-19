// Arc network details — derived from lib/networks.ts, which is the single
// source of truth for testnet vs. (future) mainnet config. Today this always
// resolves to testnet since Arc mainnet isn't live yet; see networks.ts.
// Source: https://docs.arc.io/arc/references/connect-to-arc
// Re-verify before each deployment: https://docs.arc.io/arc/references/contract-addresses

import { ACTIVE_ARC_CONFIG } from './networks'

export const ARC_CHAIN_ID = ACTIVE_ARC_CONFIG.chainId

export const ARC_RPC_URL = ACTIVE_ARC_CONFIG.rpcUrl

export const ARC_EXPLORER_URL = ACTIVE_ARC_CONFIG.explorerUrl

export const ARC_FAUCET_URL = ACTIVE_ARC_CONFIG.faucetUrl

// ERC-20 USDC on Arc (6 decimals)
export const ARC_USDC_ADDRESS = ACTIVE_ARC_CONFIG.usdcAddress

// EURC on Arc (6 decimals)
export const ARC_EURC_ADDRESS = ACTIVE_ARC_CONFIG.eurcAddress

export const ERC20_EURC_DECIMALS = 6

// ERC-20 USDC contract addresses per supported testnet (all 6 decimals)
// Source: https://developers.circle.com/stablecoins/usdc-contract-addresses
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji
  [ARC_CHAIN_ID]: ARC_USDC_ADDRESS,
}

// Native gas USDC uses 18 decimals; ERC-20 USDC uses 6 decimals
export const NATIVE_USDC_DECIMALS = 18
export const ERC20_USDC_DECIMALS = 6

// Supported source chain IDs for cross-chain bridge (testnets)
export const SUPPORTED_SOURCE_CHAIN_IDS = [
  11155111, // Ethereum Sepolia
  84532,    // Base Sepolia
  421614,   // Arbitrum Sepolia
  43113,    // Avalanche Fuji
] as const

export const CHAIN_NAMES: Record<number, string> = {
  11155111: 'Ethereum Sepolia',
  84532: 'Base Sepolia',
  421614: 'Arbitrum Sepolia',
  43113: 'Avalanche Fuji',
  [ARC_CHAIN_ID]: ACTIVE_ARC_CONFIG.label,
}

// Public testnet block explorer base URLs (tx path appended by buildExplorerTxUrl)
export const EXPLORER_BASE_URLS: Record<number, string> = {
  11155111: 'https://sepolia.etherscan.io',
  84532: 'https://sepolia.basescan.org',
  421614: 'https://sepolia.arbiscan.io',
  43113: 'https://testnet.snowtrace.io',
  [ARC_CHAIN_ID]: ARC_EXPLORER_URL,
}

export const EXPLORER_NAMES: Record<number, string> = {
  11155111: 'Etherscan',
  84532: 'Basescan',
  421614: 'Arbiscan',
  43113: 'Snowtrace',
  [ARC_CHAIN_ID]: ACTIVE_ARC_CONFIG.explorerName,
}

// Native gas token symbol per chain. Only Arc uses USDC for gas — every other
// chain here needs its own native token (ETH/AVAX), separate from USDC balance.
export const NATIVE_GAS_SYMBOLS: Record<number, string> = {
  11155111: 'ETH',
  84532: 'ETH',
  421614: 'ETH',
  43113: 'AVAX',
  [ARC_CHAIN_ID]: 'USDC',
}

// Official faucet/docs pages for topping up native gas on each non-Arc chain
export const NATIVE_GAS_FAUCET_URLS: Record<number, string> = {
  11155111: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
  84532: 'https://docs.base.org/tools/network-faucets',
  421614: 'https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info',
  43113: 'https://build.avax.network/console/primary-network/faucet',
}

// ArcConnectReceipts — deployed on Arc Testnet only. Records a non-custodial
// receipt (sender, recipient, amount, source chain, timestamp) for a payment
// that already settled via bridge/send. See contracts/src/ArcConnectReceipts.sol.
// Not yet deployed on mainnet — see contracts/README.md.
export const ARC_CONNECT_RECEIPTS_ADDRESS = '0x3acCe2Ae4563e4802473173Ed70e29020DC4bb0a' as const

// CCTP domain ids per chain, used only as informational metadata on receipts.
// Source: https://developers.circle.com/cctp/cctp-supported-blockchains
export const CCTP_DOMAINS: Record<number, number> = {
  11155111: 0, // Ethereum Sepolia
  43113: 1, // Avalanche Fuji
  421614: 3, // Arbitrum Sepolia
  84532: 6, // Base Sepolia
  [ARC_CHAIN_ID]: ACTIVE_ARC_CONFIG.cctpDomain,
}

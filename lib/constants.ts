// Arc Testnet network details
// Source: https://docs.arc.io/arc/references/connect-to-arc
// Re-verify before each deployment: https://docs.arc.io/arc/references/contract-addresses

export const ARC_CHAIN_ID = 5042002

export const ARC_RPC_URL = 'https://rpc.testnet.arc.network'

export const ARC_EXPLORER_URL = 'https://testnet.arcscan.app'

export const ARC_FAUCET_URL = 'https://faucet.circle.com'

// ERC-20 USDC on Arc Testnet (6 decimals)
// Source: https://docs.arc.io/arc/references/contract-addresses
export const ARC_USDC_ADDRESS =
  '0x3600000000000000000000000000000000000000' as const

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
  5042002: 'Arc Testnet',
}

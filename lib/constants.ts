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

// EURC on Arc Testnet (6 decimals)
// Source: https://docs.arc.io/arc/references/contract-addresses
export const ARC_EURC_ADDRESS =
  '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as const

export const ERC20_EURC_DECIMALS = 6

// ERC-20 USDC contract addresses per supported testnet (all 6 decimals)
// Source: https://developers.circle.com/stablecoins/usdc-contract-addresses
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia
  84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
  421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji
  5042002: ARC_USDC_ADDRESS, // Arc Testnet
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
  5042002: 'Arc Testnet',
}

// Public testnet block explorer base URLs (tx path appended by buildExplorerTxUrl)
export const EXPLORER_BASE_URLS: Record<number, string> = {
  11155111: 'https://sepolia.etherscan.io',
  84532: 'https://sepolia.basescan.org',
  421614: 'https://sepolia.arbiscan.io',
  43113: 'https://testnet.snowtrace.io',
  5042002: ARC_EXPLORER_URL,
}

export const EXPLORER_NAMES: Record<number, string> = {
  11155111: 'Etherscan',
  84532: 'Basescan',
  421614: 'Arbiscan',
  43113: 'Snowtrace',
  5042002: 'Arcscan',
}

// Native gas token symbol per chain. Only Arc uses USDC for gas — every other
// chain here needs its own native token (ETH/AVAX), separate from USDC balance.
export const NATIVE_GAS_SYMBOLS: Record<number, string> = {
  11155111: 'ETH',
  84532: 'ETH',
  421614: 'ETH',
  43113: 'AVAX',
  5042002: 'USDC',
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
export const ARC_CONNECT_RECEIPTS_ADDRESS = '0x3acCe2Ae4563e4802473173Ed70e29020DC4bb0a' as const

// CCTP domain ids per chain, used only as informational metadata on receipts.
// Source: https://developers.circle.com/cctp/cctp-supported-blockchains
export const CCTP_DOMAINS: Record<number, number> = {
  11155111: 0, // Ethereum Sepolia
  43113: 1, // Avalanche Fuji
  421614: 3, // Arbitrum Sepolia
  84532: 6, // Base Sepolia
  5042002: 26, // Arc Testnet
}

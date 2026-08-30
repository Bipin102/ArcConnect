import { formatUnits } from 'viem'
import { ERC20_USDC_DECIMALS, NATIVE_USDC_DECIMALS, ARC_CHAIN_ID, EXPLORER_BASE_URLS } from './constants'

// Format ERC-20 USDC balance (6 decimals)
export function formatUsdcBalance(raw: bigint): string {
  const formatted = formatUnits(raw, ERC20_USDC_DECIMALS)
  const num = parseFloat(formatted)
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

// Format native gas USDC balance (18 decimals)
export function formatNativeUsdcBalance(raw: bigint): string {
  const formatted = formatUnits(raw, NATIVE_USDC_DECIMALS)
  const num = parseFloat(formatted)
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

// Truncate an address for display: 0x1234...abcd
export function shortenAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Build a block explorer transaction URL for the given chain (defaults to Arc Testnet)
export function buildExplorerTxUrl(txHash: string, chainId: number = ARC_CHAIN_ID): string {
  const base = EXPLORER_BASE_URLS[chainId] ?? EXPLORER_BASE_URLS[ARC_CHAIN_ID]
  return `${base}/tx/${txHash}`
}

// Map App Kit chain string to wagmi chain ID
export const APPKIT_CHAIN_TO_CHAIN_ID: Record<string, number> = {
  Ethereum_Sepolia: 11155111,
  Base_Sepolia: 84532,
  Arbitrum_Sepolia: 421614,
  Avalanche_Fuji: 43113,
  Arc_Testnet: 5042002,
}

// Map wagmi chain ID to App Kit Blockchain enum string
export const CHAIN_ID_TO_APPKIT: Record<number, string> = {
  11155111: 'Ethereum_Sepolia',
  84532: 'Base_Sepolia',
  421614: 'Arbitrum_Sepolia',
  43113: 'Avalanche_Fuji',
  5042002: 'Arc_Testnet',
}

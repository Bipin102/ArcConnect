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

// Turn a raw wagmi/viem connect error into a message a user can act on
export function formatConnectError(error: { name?: string; message?: string }): string {
  if (error.name === 'ProviderNotFoundError') {
    return 'No wallet extension detected in this browser. Use WalletConnect to connect a mobile wallet app instead.'
  }
  if (error.message?.includes('User rejected')) {
    return 'Connection request was rejected.'
  }
  return error.message ?? 'Failed to connect wallet.'
}

// Truncate an address for display: 0x1234...abcd
export function shortenAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Build a block explorer transaction URL for the given chain (defaults to Arc)
export function buildExplorerTxUrl(txHash: string, chainId: number = ARC_CHAIN_ID): string {
  const base = EXPLORER_BASE_URLS[chainId] ?? EXPLORER_BASE_URLS[ARC_CHAIN_ID]
  return `${base}/tx/${txHash}`
}

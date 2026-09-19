// Arc network configuration — a single source of truth that the rest of the
// app derives its Arc-specific constants from.
//
// Testnet is fully live and every value below has been verified against
// https://docs.arc.io. Mainnet is a placeholder scaffold ONLY: Arc mainnet
// had not launched as of 2026-09-19 (docs.arc.io only documents testnet —
// no mainnet chain ID, RPC, explorer, or contract addresses exist yet).
//
// When Arc mainnet does ship, fill in `mainnet` below with values verified
// fresh from https://docs.arc.io/arc/references/connect-to-arc and
// https://docs.arc.io/arc/references/contract-addresses — never guess or
// carry over testnet numbers — then flip `isLive: true`. Note this only
// prepares ArcConnect's own frontend config; the actual bridge/swap flows
// also depend on Circle's App Kit SDK (@circle-fin/app-kit) shipping an
// Arc mainnet BridgeChain — that's a separate, external dependency this
// file can't control.

export type ArcNetworkKey = 'testnet' | 'mainnet'

export interface ArcNetworkConfig {
  key: ArcNetworkKey
  label: string
  chainId: number
  rpcUrl: string
  wsRpcUrl: string
  explorerUrl: string
  explorerName: string
  faucetUrl: string
  usdcAddress: `0x${string}`
  eurcAddress: `0x${string}`
  cctpDomain: number
  isLive: boolean
}

export const ARC_NETWORKS: Record<ArcNetworkKey, ArcNetworkConfig> = {
  testnet: {
    key: 'testnet',
    label: 'Arc Testnet',
    chainId: 5042002,
    rpcUrl: 'https://rpc.testnet.arc.network',
    wsRpcUrl: 'wss://rpc.testnet.arc.network',
    explorerUrl: 'https://testnet.arcscan.app',
    explorerName: 'Arcscan',
    faucetUrl: 'https://faucet.circle.com',
    usdcAddress: '0x3600000000000000000000000000000000000000',
    eurcAddress: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
    cctpDomain: 26,
    isLive: true,
  },
  mainnet: {
    key: 'mainnet',
    label: 'Arc Mainnet (not yet available)',
    // Placeholders only — do not use. See file header before filling these in.
    chainId: 0,
    rpcUrl: '',
    wsRpcUrl: '',
    explorerUrl: '',
    explorerName: 'Arcscan',
    faucetUrl: '',
    usdcAddress: '0x0000000000000000000000000000000000000000',
    eurcAddress: '0x0000000000000000000000000000000000000000',
    cctpDomain: -1,
    isLive: false,
  },
}

// Resolves from NEXT_PUBLIC_ARC_NETWORK. Falls back to testnet whenever
// mainnet is requested but not actually live, so a stray env var can never
// point the running app at empty/placeholder config.
function resolveActiveNetwork(): ArcNetworkKey {
  const requested = process.env.NEXT_PUBLIC_ARC_NETWORK
  if (requested === 'mainnet' && ARC_NETWORKS.mainnet.isLive) return 'mainnet'
  return 'testnet'
}

export const ACTIVE_ARC_NETWORK: ArcNetworkKey = resolveActiveNetwork()
export const ACTIVE_ARC_CONFIG: ArcNetworkConfig = ARC_NETWORKS[ACTIVE_ARC_NETWORK]

// Arc network configuration — a single source of truth that the rest of the
// app derives its Arc-specific constants from.
//
// Arc Mainnet is real and live as of 2026-09-19 (chain ID 5042). Verified
// independently across three sources before filling anything in below:
// the RPC's own eth_chainId response, Alchemy's public chain-connect page,
// and docs.arc.io/arc/references/connect-to-arc. USDC and EURC addresses
// were each confirmed on-chain via symbol()/decimals() calls against
// https://rpc.mainnet.arc.io, the same way every testnet value here was
// verified rather than trusted from a doc alone.
//
// `isLive` is still false, deliberately. The Arc chain itself is live, but
// bridge/swap here goes through Circle's App Kit SDK (@circle-fin/app-kit),
// and the installed version's BridgeChain enum only has Arc_Testnet — no
// mainnet entry (see hooks/usePay.ts, hooks/useSwap.ts). Flipping isLive
// before that SDK support exists would let someone submit a real-money
// bridge against testnet CCTP domain/contract data — a real way to lose
// funds, not a hypothetical one. Flip it only once @circle-fin/app-kit
// ships Arc mainnet support, and re-verify these values are still current
// first (mainnet.faucetUrl is intentionally blank — there is no mainnet
// faucet; any UI copy that assumes one needs a pass before this goes live).

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
    label: 'Arc Mainnet',
    chainId: 5042,
    // Official public RPC — verified working, no API key required. A
    // private/paid RPC (e.g. Alchemy) can be swapped in later via an env
    // var if needed for reliability; never hardcode a personal API key into
    // this file, since it ships in the public repo and the client bundle.
    rpcUrl: 'https://rpc.mainnet.arc.io',
    // Not independently verified (wss endpoint untested) — leave blank
    // rather than guess; wagmi/viem work fine without it.
    wsRpcUrl: '',
    explorerUrl: 'https://explorer.arc.io',
    explorerName: 'Arc Explorer',
    // No mainnet faucet exists — this is intentionally blank, see file header.
    faucetUrl: '',
    usdcAddress: '0x3600000000000000000000000000000000000000',
    eurcAddress: '0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1',
    // Circle's CCTP domain list doesn't distinguish Arc testnet vs mainnet
    // (both listed simply as "Arc" = 26 as of this verification) — re-check
    // this specifically before it's ever used for a real transfer.
    cctpDomain: 26,
    // See file header — blocked on @circle-fin/app-kit shipping Arc mainnet
    // BridgeChain support, not on this config being incomplete.
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

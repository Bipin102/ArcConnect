import { createConfig, http } from 'wagmi'
import { sepolia, baseSepolia, arbitrumSepolia, avalancheFuji } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { arcTestnet } from './arcChain'
import { ARC_RPC_URL } from './constants'

const connectors = [
  injected(),
  ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    ? [
        walletConnect({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          showQrModal: true,
        }),
      ]
    : []),
]

export const wagmiConfig = createConfig({
  chains: [arcTestnet, sepolia, baseSepolia, arbitrumSepolia, avalancheFuji],
  connectors,
  transports: {
    [arcTestnet.id]: http(ARC_RPC_URL),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: true,
})

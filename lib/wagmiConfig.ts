import { createConfig, http } from 'wagmi'
import { sepolia, baseSepolia, arbitrumSepolia, avalancheFuji } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { arcTestnet } from './arcChain'

const connectors = [
  injected(),
  ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    ? [
        walletConnect({
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        }),
      ]
    : []),
]

export const wagmiConfig = createConfig({
  chains: [arcTestnet, sepolia, baseSepolia, arbitrumSepolia, avalancheFuji],
  connectors,
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: true,
})

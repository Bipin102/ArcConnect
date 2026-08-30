# Arc Testnet network details
# Source: https://docs.arc.io/arc/references/connect-to-arc
# Re-verify before each deployment: https://docs.arc.io/arc/references/contract-addresses

ARC_CHAIN_ID = 5042002

ARC_RPC_URL = "https://rpc.testnet.arc.network"

ARC_EXPLORER_URL = "https://testnet.arcscan.app"

ARC_FAUCET_URL = "https://faucet.circle.com"

# ERC-20 USDC on Arc Testnet (6 decimals)
# Source: https://docs.arc.io/arc/references/contract-addresses
ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000"

# Native gas USDC uses 18 decimals; ERC-20 USDC uses 6 decimals
NATIVE_USDC_DECIMALS = 18
ERC20_USDC_DECIMALS = 6

# Supported source chain IDs for cross-chain bridge (testnets)
SUPPORTED_SOURCE_CHAIN_IDS = [
    11155111,  # Ethereum Sepolia
    84532,  # Base Sepolia
    421614,  # Arbitrum Sepolia
    43113,  # Avalanche Fuji
]

CHAIN_NAMES = {
    11155111: "Ethereum Sepolia",
    84532: "Base Sepolia",
    421614: "Arbitrum Sepolia",
    43113: "Avalanche Fuji",
    5042002: "Arc Testnet",
}

# Map wagmi-style chain ID to Circle App Kit BridgeChain enum member name
CHAIN_ID_TO_BRIDGE_CHAIN = {
    11155111: "Ethereum_Sepolia",
    84532: "Base_Sepolia",
    421614: "Arbitrum_Sepolia",
    43113: "Avalanche_Fuji",
    5042002: "Arc_Testnet",
}

# Public testnet block explorer base URL per chain, used to build tx links
# regardless of which chain a bridge/swap actually lands on.
CHAIN_EXPLORERS = {
    11155111: "https://sepolia.etherscan.io",
    84532: "https://sepolia.basescan.org",
    421614: "https://sepolia.arbiscan.io",
    43113: "https://testnet.snowtrace.io",
    5042002: ARC_EXPLORER_URL,
}

# Public RPC endpoint per chain, so the client can read the connected
# wallet's USDC balance on whichever chain it's currently on (not just Arc).
# Verified live (correct eth_chainId) before use.
CHAIN_RPC_URLS = {
    11155111: "https://ethereum-sepolia-rpc.publicnode.com",
    84532: "https://sepolia.base.org",
    421614: "https://sepolia-rollup.arbitrum.io/rpc",
    43113: "https://api.avax-test.network/ext/bc/C/rpc",
    5042002: ARC_RPC_URL,
}

# Circle's official testnet USDC contract address per chain (6 decimals
# everywhere except Arc's *native* gas USDC, which is 18 — see
# NATIVE_USDC_DECIMALS). Verified against
# https://developers.circle.com/stablecoins/usdc-contract-addresses and
# sanity-checked live (decimals()/symbol() calls) before use.
CHAIN_USDC_ADDRESSES = {
    11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    43113: "0x5425890298aed601595a70AB815c96711a31Bc65",
    5042002: ARC_USDC_ADDRESS,
}

# Native gas token symbol per chain. Arc's native token *is* USDC (same asset
# as ARC_USDC_ADDRESS, just 18 vs 6 decimals — see NATIVE_USDC_DECIMALS), so
# there's nothing to swap on Arc; the other four are real ETH/AVAX ⇄ USDC pairs.
CHAIN_NATIVE_SYMBOLS = {
    11155111: "ETH",
    84532: "ETH",
    421614: "ETH",
    43113: "AVAX",
    5042002: "USDC",
}


def as_config_dict():
    """Canonical config shipped to the client as JSON."""
    return {
        "arcChainId": ARC_CHAIN_ID,
        "arcRpcUrl": ARC_RPC_URL,
        "arcExplorerUrl": ARC_EXPLORER_URL,
        "arcFaucetUrl": ARC_FAUCET_URL,
        "arcUsdcAddress": ARC_USDC_ADDRESS,
        "nativeUsdcDecimals": NATIVE_USDC_DECIMALS,
        "erc20UsdcDecimals": ERC20_USDC_DECIMALS,
        "supportedSourceChainIds": SUPPORTED_SOURCE_CHAIN_IDS,
        "chainNames": CHAIN_NAMES,
        "chainIdToBridgeChain": CHAIN_ID_TO_BRIDGE_CHAIN,
        "chainExplorers": CHAIN_EXPLORERS,
        "chainRpcUrls": CHAIN_RPC_URLS,
        "chainUsdcAddresses": CHAIN_USDC_ADDRESSES,
        "chainNativeSymbols": CHAIN_NATIVE_SYMBOLS,
    }

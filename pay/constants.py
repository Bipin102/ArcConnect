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
    }

const raw = document.getElementById("arc-config").textContent;
const parsed = JSON.parse(raw);

export const ARC_CHAIN_ID = parsed.arcChainId;
export const ARC_RPC_URL = parsed.arcRpcUrl;
export const ARC_EXPLORER_URL = parsed.arcExplorerUrl;
export const ARC_FAUCET_URL = parsed.arcFaucetUrl;
export const ARC_USDC_ADDRESS = parsed.arcUsdcAddress;
export const NATIVE_USDC_DECIMALS = parsed.nativeUsdcDecimals;
export const ERC20_USDC_DECIMALS = parsed.erc20UsdcDecimals;
export const SUPPORTED_SOURCE_CHAIN_IDS = parsed.supportedSourceChainIds;

// Keys arrive as strings from JSON; normalize back to numeric chain IDs.
export const CHAIN_NAMES = Object.fromEntries(
  Object.entries(parsed.chainNames).map(([id, name]) => [Number(id), name]),
);

export const CHAIN_ID_TO_BRIDGE_CHAIN = Object.fromEntries(
  Object.entries(parsed.chainIdToBridgeChain).map(([id, name]) => [Number(id), name]),
);

export const CHAIN_EXPLORERS = Object.fromEntries(
  Object.entries(parsed.chainExplorers).map(([id, url]) => [Number(id), url]),
);

export const CHAIN_RPC_URLS = Object.fromEntries(
  Object.entries(parsed.chainRpcUrls).map(([id, url]) => [Number(id), url]),
);

export const CHAIN_USDC_ADDRESSES = Object.fromEntries(
  Object.entries(parsed.chainUsdcAddresses).map(([id, address]) => [Number(id), address]),
);

export const ALL_SUPPORTED_CHAIN_IDS = [ARC_CHAIN_ID, ...SUPPORTED_SOURCE_CHAIN_IDS];

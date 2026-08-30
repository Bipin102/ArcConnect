import {
  ARC_CHAIN_ID,
  ARC_RPC_URL,
  ARC_EXPLORER_URL,
  NATIVE_USDC_DECIMALS,
} from "./config.js";

export function hasInjectedWallet() {
  return typeof window.ethereum !== "undefined";
}

export function getProvider() {
  return window.ethereum;
}

export async function getAccounts() {
  if (!hasInjectedWallet()) return [];
  return window.ethereum.request({ method: "eth_accounts" });
}

export async function connect() {
  if (!hasInjectedWallet()) throw new Error("Install MetaMask to continue.");
  return window.ethereum.request({ method: "eth_requestAccounts" });
}

export async function getChainId() {
  if (!hasInjectedWallet()) return null;
  const hex = await window.ethereum.request({ method: "eth_chainId" });
  return parseInt(hex, 16);
}

function toHexChainId(chainId) {
  return `0x${chainId.toString(16)}`;
}

export async function switchChain(chainId) {
  if (!hasInjectedWallet()) throw new Error("Install MetaMask to continue.");
  const hexChainId = toHexChainId(chainId);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (err) {
    // 4902: chain not added to the wallet yet.
    if (err && err.code === 4902 && chainId === ARC_CHAIN_ID) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: "Arc Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: NATIVE_USDC_DECIMALS },
            rpcUrls: [ARC_RPC_URL],
            blockExplorerUrls: [ARC_EXPLORER_URL],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export function onAccountsChanged(callback) {
  if (!hasInjectedWallet()) return;
  window.ethereum.on("accountsChanged", callback);
}

export function onChainChanged(callback) {
  if (!hasInjectedWallet()) return;
  window.ethereum.on("chainChanged", callback);
}

import { ARC_RPC_URL, ARC_USDC_ADDRESS, CHAIN_RPC_URLS, CHAIN_USDC_ADDRESSES } from "./config.js";

let requestId = 0;

async function rpcCall(rpcUrl, method, params) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++requestId, method, params }),
  });
  const body = await response.json();
  if (body.error) throw new Error(body.error.message || "RPC error");
  return body.result;
}

// Native gas USDC balance on Arc Testnet (18 decimals)
export async function getNativeBalance(address) {
  const hex = await rpcCall(ARC_RPC_URL, "eth_getBalance", [address, "latest"]);
  return BigInt(hex);
}

// ERC-20 balanceOf(address) calldata: selector + address padded to 32 bytes
function encodeBalanceOfCalldata(address) {
  const selector = "70a08231";
  const paddedAddress = address.toLowerCase().replace("0x", "").padStart(64, "0");
  return `0x${selector}${paddedAddress}`;
}

// ERC-20 USDC balance on Arc Testnet (6 decimals)
export async function getUsdcBalance(address) {
  return getUsdcBalanceOnChain(null, address);
}

// ERC-20 USDC balance (6 decimals) on any of the app's supported chains —
// used to show "Balance: X" for whichever chain is currently selected as
// the bridge/swap source. Returns null if the chain isn't recognized.
export async function getUsdcBalanceOnChain(chainId, address) {
  const rpcUrl = chainId ? CHAIN_RPC_URLS[chainId] : ARC_RPC_URL;
  const tokenAddress = chainId ? CHAIN_USDC_ADDRESSES[chainId] : ARC_USDC_ADDRESS;
  if (!rpcUrl || !tokenAddress) return null;

  const hex = await rpcCall(rpcUrl, "eth_call", [
    { to: tokenAddress, data: encodeBalanceOfCalldata(address) },
    "latest",
  ]);
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

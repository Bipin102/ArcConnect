import { ARC_RPC_URL, ARC_USDC_ADDRESS } from "./config.js";

let requestId = 0;

async function rpcCall(method, params) {
  const response = await fetch(ARC_RPC_URL, {
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
  const hex = await rpcCall("eth_getBalance", [address, "latest"]);
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
  const hex = await rpcCall("eth_call", [
    { to: ARC_USDC_ADDRESS, data: encodeBalanceOfCalldata(address) },
    "latest",
  ]);
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

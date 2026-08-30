import { ERC20_USDC_DECIMALS, NATIVE_USDC_DECIMALS, ARC_EXPLORER_URL } from "./config.js";

// Port of viem's formatUnits: raw bigint + decimals -> decimal string.
function formatUnits(raw, decimals) {
  const negative = raw < 0n;
  const value = negative ? -raw : raw;
  const divisor = 10n ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = (value % divisor).toString().padStart(decimals, "0");
  const trimmedFraction = fraction.replace(/0+$/, "");
  const result = trimmedFraction ? `${whole}.${trimmedFraction}` : `${whole}`;
  return negative ? `-${result}` : result;
}

function formatBalance(raw, decimals) {
  const formatted = formatUnits(raw, decimals);
  const num = parseFloat(formatted);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

// Format ERC-20 USDC balance (6 decimals)
export function formatUsdcBalance(raw) {
  return formatBalance(raw, ERC20_USDC_DECIMALS);
}

// Format native gas USDC balance (18 decimals)
export function formatNativeUsdcBalance(raw) {
  return formatBalance(raw, NATIVE_USDC_DECIMALS);
}

// Truncate an address for display: 0x1234...abcd
export function shortenAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Build Arcscan transaction URL
export function buildExplorerTxUrl(txHash) {
  return `${ARC_EXPLORER_URL}/tx/${txHash}`;
}

// Minimal stand-in for viem's isAddress (checksum validation isn't required here).
export function isAddress(value) {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

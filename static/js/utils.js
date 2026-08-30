import { ERC20_USDC_DECIMALS, NATIVE_USDC_DECIMALS, ARC_EXPLORER_URL, CHAIN_EXPLORERS } from "./config.js";

// Port of viem's formatUnits: raw bigint + decimals -> plain decimal string
// (no thousands separators — safe to drop straight into a number input,
// unlike the locale-formatted display strings below).
export function formatUnits(raw, decimals) {
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

// Plain (no thousands separators) ERC-20 USDC amount — for filling a MAX
// amount straight into a number input, where formatUsdcBalance's
// locale-formatted string (e.g. "1,234.5") would be invalid.
export function formatUsdcAmountPlain(raw) {
  return formatUnits(raw, ERC20_USDC_DECIMALS);
}

// Plain native-token amount (ETH/AVAX/etc., 18 decimals) — same MAX-fill use
// case as formatUsdcAmountPlain above.
export function formatNativeAmountPlain(raw) {
  return formatUnits(raw, NATIVE_USDC_DECIMALS);
}

// Truncate an address for display: 0x1234...abcd
export function shortenAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Build a transaction URL on the given destination chain's explorer
// (falls back to Arcscan if the chain isn't recognized).
export function buildExplorerTxUrl(txHash, chainId) {
  const base = CHAIN_EXPLORERS[chainId] ?? ARC_EXPLORER_URL;
  return `${base}/tx/${txHash}`;
}

// Minimal stand-in for viem's isAddress (checksum validation isn't required here).
export function isAddress(value) {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

import { CHAIN_ID_TO_BRIDGE_CHAIN, CHAIN_NAMES } from "./config.js";
import { buildExplorerTxUrl } from "./utils.js";
import { getProvider } from "./wallet.js";

let appKitModules = null;

async function loadAppKit() {
  if (appKitModules) return appKitModules;
  const [core, adapter, chains] = await Promise.all([
    import("https://esm.sh/@circle-fin/app-kit"),
    import("https://esm.sh/@circle-fin/adapter-viem-v2"),
    import("https://esm.sh/@circle-fin/app-kit/chains"),
  ]);
  appKitModules = {
    AppKit: core.AppKit,
    BridgeChain: core.BridgeChain,
    createViemAdapterFromProvider: adapter.createViemAdapterFromProvider,
    supportedChains: [
      chains.EthereumSepolia,
      chains.BaseSepolia,
      chains.ArbitrumSepolia,
      chains.AvalancheFuji,
      chains.ArcTestnet,
    ],
    kit: new core.AppKit(),
  };
  return appKitModules;
}

async function buildAdapter(kitModules) {
  const { createViemAdapterFromProvider, supportedChains } = kitModules;
  return createViemAdapterFromProvider({
    provider: getProvider(),
    capabilities: {
      addressContext: "user-controlled",
      supportedChains,
    },
  });
}

// Extract the last successful tx hash from bridge result steps
function extractTxHash(result) {
  const successStep = [...result.steps].reverse().find((s) => s.txHash && s.state === "success");
  return successStep?.txHash ?? "";
}

// Cross-chain USDC bridge (fromChainId always differs from toChainId — the
// UI never offers the same chain on both sides, that's what Swap is for).
// `onStatus` receives PayStatus shapes ({state: 'pending'|'success'|'error', ...}).
export async function bridge(recipient, amount, fromChainId, toChainId, onStatus) {
  if (!fromChainId || !toChainId) {
    onStatus({ state: "error", message: "Wallet not connected." });
    return;
  }

  const fromBridgeChainName = CHAIN_ID_TO_BRIDGE_CHAIN[fromChainId];
  const toBridgeChainName = CHAIN_ID_TO_BRIDGE_CHAIN[toChainId];
  if (!fromBridgeChainName || !toBridgeChainName) {
    onStatus({
      state: "error",
      message: "One of the selected chains isn't supported for payments.",
    });
    return;
  }

  try {
    onStatus({ state: "pending", message: "Connecting to wallet..." });

    const kitModules = await loadAppKit();
    const { BridgeChain, kit } = kitModules;
    const sourceBridgeChain = BridgeChain[fromBridgeChainName];
    const destBridgeChain = BridgeChain[toBridgeChainName];
    const adapter = await buildAdapter(kitModules);

    onStatus({ state: "pending", message: "Waiting for wallet approval..." });

    const result = await kit.bridge({
      from: { adapter, chain: sourceBridgeChain },
      to: {
        adapter,
        chain: destBridgeChain,
        recipientAddress: recipient,
      },
      amount,
    });

    const txHash = extractTxHash(result);
    onStatus({
      state: "success",
      txHash,
      explorerUrl: buildExplorerTxUrl(txHash, toChainId),
      amount,
      recipient,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred.";
    onStatus({ state: "error", message });
  }
}

// Same-chain token swap (e.g. ETH -> USDC on Ethereum Sepolia), always to the
// connected wallet's own address — real swaps don't take a recipient.
export async function swap(chainId, tokenIn, tokenOut, amountIn, onStatus) {
  const bridgeChainName = CHAIN_ID_TO_BRIDGE_CHAIN[chainId];
  if (!bridgeChainName) {
    onStatus({ state: "error", message: "This chain isn't supported for swaps." });
    return;
  }

  try {
    onStatus({ state: "pending", message: "Connecting to wallet..." });

    const kitModules = await loadAppKit();
    const { BridgeChain, kit } = kitModules;
    const chain = BridgeChain[bridgeChainName];
    const adapter = await buildAdapter(kitModules);

    onStatus({ state: "pending", message: `Swapping ${tokenIn} for ${tokenOut} on ${CHAIN_NAMES[chainId]}...` });

    const result = await kit.swap({
      from: { adapter, chain },
      tokenIn,
      tokenOut,
      amountIn,
    });

    onStatus({
      state: "success",
      txHash: result.txHash,
      explorerUrl: result.txHash ? buildExplorerTxUrl(result.txHash, chainId) : undefined,
      tokenIn: result.tokenIn ?? tokenIn,
      tokenOut: result.tokenOut ?? tokenOut,
      amountIn: result.amountIn ?? amountIn,
      amountOut: result.amountOut,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred.";
    onStatus({ state: "error", message });
  }
}

// Live output-amount quote for the swap form (best-effort — callers should
// treat a thrown error as "no estimate available" and just hide the preview).
export async function estimateSwap(chainId, tokenIn, tokenOut, amountIn) {
  const bridgeChainName = CHAIN_ID_TO_BRIDGE_CHAIN[chainId];
  if (!bridgeChainName) return null;

  const kitModules = await loadAppKit();
  const { BridgeChain, kit } = kitModules;
  const chain = BridgeChain[bridgeChainName];
  const adapter = await buildAdapter(kitModules);

  const estimate = await kit.estimateSwap({
    from: { adapter, chain },
    tokenIn,
    tokenOut,
    amountIn,
  });
  return estimate.estimatedOutput ?? null;
}

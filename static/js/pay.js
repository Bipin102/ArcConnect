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

// Extract the last successful tx hash from bridge result steps
function extractTxHash(result) {
  const successStep = [...result.steps].reverse().find((s) => s.txHash && s.state === "success");
  return successStep?.txHash ?? "";
}

// Mirrors hooks/usePay.ts, generalized to any from/to pair among the
// supported chains: `onStatus` receives the same PayStatus shapes
// ({state: 'pending'|'success'|'error', ...}) the React version rendered.
// fromChainId === toChainId does a same-chain send; otherwise it bridges.
export async function pay(recipient, amount, fromChainId, toChainId, onStatus) {
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

    const { BridgeChain, createViemAdapterFromProvider, supportedChains, kit } = await loadAppKit();
    const sourceBridgeChain = BridgeChain[fromBridgeChainName];
    const destBridgeChain = BridgeChain[toBridgeChainName];

    const adapter = await createViemAdapterFromProvider({
      provider: getProvider(),
      capabilities: {
        addressContext: "user-controlled",
        supportedChains,
      },
    });

    if (fromChainId === toChainId) {
      // Same chain on both ends — use send instead of bridge.
      onStatus({ state: "pending", message: `Sending USDC on ${CHAIN_NAMES[fromChainId]}...` });

      const result = await kit.send({
        from: { adapter, chain: sourceBridgeChain },
        to: recipient,
        amount,
        token: "USDC",
      });

      const txHash = result?.txHash ?? "";
      onStatus({
        state: "success",
        txHash,
        explorerUrl: buildExplorerTxUrl(txHash, toChainId),
        amount,
        recipient,
      });
    } else {
      // Cross-chain bridge from fromChainId to toChainId with recipient address.
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
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred.";
    onStatus({ state: "error", message });
  }
}

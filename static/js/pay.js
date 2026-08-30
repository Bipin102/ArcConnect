import { ARC_CHAIN_ID, CHAIN_ID_TO_BRIDGE_CHAIN } from "./config.js";
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

// Mirrors hooks/usePay.ts: `onStatus` receives the same PayStatus shapes
// ({state: 'pending'|'success'|'error', ...}) the React version rendered.
export async function pay(recipient, amount, chainId, onStatus) {
  if (!chainId) {
    onStatus({ state: "error", message: "Wallet not connected." });
    return;
  }

  const bridgeChainName = CHAIN_ID_TO_BRIDGE_CHAIN[chainId];
  if (!bridgeChainName) {
    onStatus({
      state: "error",
      message: `Chain ID ${chainId} is not supported as a payment source. Switch to Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, or Avalanche Fuji.`,
    });
    return;
  }

  try {
    onStatus({ state: "pending", message: "Connecting to wallet..." });

    const { BridgeChain, createViemAdapterFromProvider, supportedChains, kit } = await loadAppKit();
    const sourceBridgeChain = BridgeChain[bridgeChainName];

    const adapter = await createViemAdapterFromProvider({
      provider: getProvider(),
      capabilities: {
        addressContext: "user-controlled",
        supportedChains,
      },
    });

    if (chainId === ARC_CHAIN_ID) {
      // Already on Arc Testnet — use send (same-chain)
      onStatus({ state: "pending", message: "Sending USDC on Arc Testnet..." });

      const result = await kit.send({
        from: { adapter, chain: BridgeChain.Arc_Testnet },
        to: recipient,
        amount,
        token: "USDC",
      });

      const txHash = result?.txHash ?? "";
      onStatus({
        state: "success",
        txHash,
        explorerUrl: buildExplorerTxUrl(txHash),
        amount,
        recipient,
      });
    } else {
      // Cross-chain bridge to Arc Testnet with recipient address
      onStatus({ state: "pending", message: "Waiting for wallet approval..." });

      const result = await kit.bridge({
        from: { adapter, chain: sourceBridgeChain },
        to: {
          adapter,
          chain: BridgeChain.Arc_Testnet,
          recipientAddress: recipient,
        },
        amount,
      });

      const txHash = extractTxHash(result);
      onStatus({
        state: "success",
        txHash,
        explorerUrl: buildExplorerTxUrl(txHash),
        amount,
        recipient,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error occurred.";
    onStatus({ state: "error", message });
  }
}

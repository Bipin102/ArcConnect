import {
  ARC_CHAIN_ID,
  ARC_FAUCET_URL,
  CHAIN_NAMES,
  SUPPORTED_SOURCE_CHAIN_IDS,
  ALL_SUPPORTED_CHAIN_IDS,
} from "./config.js";
import { shortenAddress } from "./utils.js";

const SPINNER = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>`;

export function renderConnectButton(el, state, handlers) {
  if (state.address) {
    el.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 glass px-3 py-1.5 rounded-xl border border-white/8">
          <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-dot"></span>
          <span class="text-sm text-gray-300 font-mono">${shortenAddress(state.address)}</span>
        </div>
        <button data-action="disconnect" class="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5">
          Disconnect
        </button>
      </div>
    `;
    el.querySelector('[data-action="disconnect"]').addEventListener("click", handlers.onDisconnect);
    return;
  }

  if (!state.hasWallet) {
    el.innerHTML = `<p class="text-sm text-gray-600">Install MetaMask to continue.</p>`;
    return;
  }

  el.innerHTML = `
    <button
      data-action="connect"
      ${state.connecting ? "disabled" : ""}
      class="btn-gradient text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
    >
      ${state.connecting ? `<span class="flex items-center gap-2">${SPINNER} Connecting</span>` : "Connect Wallet"}
    </button>
  `;
  el.querySelector('[data-action="connect"]').addEventListener("click", handlers.onConnect);
}

export function renderNetworkGuard(el, state, handlers) {
  if (!state.address || !state.chainId || ALL_SUPPORTED_CHAIN_IDS.includes(state.chainId)) {
    el.innerHTML = "";
    return;
  }

  const chainButtons = SUPPORTED_SOURCE_CHAIN_IDS.map(
    (id) => `
      <button
        data-switch-chain="${id}"
        ${state.switching ? "disabled" : ""}
        class="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        ${CHAIN_NAMES[id]}
      </button>
    `,
  ).join("");

  el.innerHTML = `
    <div class="glass rounded-2xl p-4 mb-4 border border-amber-500/20 fade-in">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-amber-300 mb-2">Unsupported Network</p>
          <p class="text-xs text-gray-500 mb-3">Switch to a supported testnet to continue.</p>
          <div class="flex flex-wrap gap-1.5">
            ${chainButtons}
            <button
              data-switch-chain="${ARC_CHAIN_ID}"
              ${state.switching ? "disabled" : ""}
              class="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Arc Testnet
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  el.querySelectorAll("[data-switch-chain]").forEach((btn) => {
    btn.addEventListener("click", () => handlers.onSwitchChain(Number(btn.dataset.switchChain)));
  });
}

export function renderBalanceDisplay(el, state) {
  if (!state.address) {
    el.innerHTML = "";
    return;
  }

  const hasGas = state.gas.raw > 0n;
  const gasValue = state.gas.isLoading
    ? `<span class="shimmer inline-block w-16 h-4 rounded"></span>`
    : state.gas.formatted;
  const usdcValue = state.usdc.isLoading
    ? `<span class="shimmer inline-block w-16 h-4 rounded"></span>`
    : state.usdc.formatted;

  el.innerHTML = `
    <div class="glass rounded-2xl p-4 mb-4 fade-in">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-widest">
          Arc Testnet Balances
        </p>
        ${
          !hasGas
            ? `<a href="${ARC_FAUCET_URL}" target="_blank" rel="noopener noreferrer" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                Get testnet USDC
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>`
            : ""
        }
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white/3 rounded-xl p-3">
          <p class="text-xs text-gray-600 mb-1">Gas USDC</p>
          <p class="text-sm font-semibold font-mono ${hasGas ? "text-emerald-400" : "text-red-400"}">${gasValue}</p>
          <p class="text-xs text-gray-700 mt-0.5">native · 18 dec</p>
        </div>
        <div class="bg-white/3 rounded-xl p-3">
          <p class="text-xs text-gray-600 mb-1">ERC-20 USDC</p>
          <p class="text-sm font-semibold font-mono ${state.usdc.raw > 0n ? "text-emerald-400" : "text-gray-500"}">${usdcValue}</p>
          <p class="text-xs text-gray-700 mt-0.5">token · 6 dec</p>
        </div>
      </div>
    </div>
  `;
}

function errorMarkup(message) {
  if (!message) return "";
  return `
    <p class="text-red-400 text-xs mt-1.5 flex items-center gap-1" data-error-text>
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      ${message}
    </p>
  `;
}

export function renderPaymentForm(el, state, handlers) {
  if (!state.address) {
    el.innerHTML = `
      <div class="glass rounded-2xl p-8 text-center fade-in space-y-5">
        <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <p class="text-white font-semibold mb-1">Connect your wallet</p>
          <p class="text-gray-600 text-sm">Choose your wallet to start sending USDC cross-chain.</p>
        </div>
        <div class="space-y-2">
          ${
            state.hasWallet
              ? `<button data-action="connect" ${state.connecting ? "disabled" : ""} class="btn-gradient w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                  ${
                    state.connecting
                      ? `${SPINNER} Connecting...`
                      : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Connect Wallet`
                  }
                </button>`
              : `<p class="text-sm text-gray-600">No wallet detected. Install MetaMask to continue.</p>`
          }
        </div>
      </div>
    `;
    const btn = el.querySelector('[data-action="connect"]');
    if (btn) btn.addEventListener("click", handlers.onConnect);
    return;
  }

  const currentChainName = state.chainId ? (CHAIN_NAMES[state.chainId] ?? `Chain ${state.chainId}`) : "—";
  const isSupportedChain = state.chainId ? ALL_SUPPORTED_CHAIN_IDS.includes(state.chainId) : false;
  const isOnArc = state.chainId === ARC_CHAIN_ID;
  const isPending = state.payStatus.state === "pending";

  el.innerHTML = `
    <div class="space-y-3 fade-in">
      <div class="glass rounded-2xl p-6 space-y-5">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-600 uppercase tracking-widest font-medium">From</span>
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full ${isSupportedChain ? "bg-emerald-400" : "bg-red-400"}"></span>
            <span class="text-sm text-gray-300 font-medium">${currentChainName}</span>
          </div>
        </div>

        ${
          isOnArc
            ? `<div class="flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2.5">
                <svg class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-indigo-300">On Arc Testnet — sending same-chain USDC.</p>
              </div>`
            : ""
        }

        <form data-form="pay" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
              Recipient · Arc Testnet
            </label>
            <input
              type="text"
              name="recipient"
              data-field="recipient"
              value="${state.recipient ?? ""}"
              placeholder="0x0000...0000"
              ${isPending ? "disabled" : ""}
              class="w-full bg-white/4 border border-white/8 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm font-mono text-gray-100 placeholder-gray-700 outline-none transition-all disabled:opacity-40"
            />
            <div data-error="recipient">${errorMarkup(state.formErrors.recipient)}</div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">
              Amount
            </label>
            <div class="relative">
              <input
                type="number"
                name="amount"
                data-field="amount"
                value="${state.amount ?? ""}"
                placeholder="0.00"
                min="0"
                step="0.000001"
                ${isPending ? "disabled" : ""}
                class="w-full bg-white/4 border border-white/8 focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-700 outline-none transition-all disabled:opacity-40 pr-20"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                USDC
              </span>
            </div>
            <div data-error="amount">${errorMarkup(state.formErrors.amount)}</div>
          </div>

          <button
            type="submit"
            ${isPending || !isSupportedChain ? "disabled" : ""}
            class="btn-gradient w-full text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-indigo-500/20"
          >
            ${
              isPending
                ? `<span class="flex items-center justify-center gap-2">${SPINNER} Processing...</span>`
                : isOnArc
                  ? "Send USDC"
                  : `<span class="flex items-center justify-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Pay Cross-Chain</span>`
            }
          </button>
        </form>

        ${
          !isSupportedChain
            ? `<p class="text-xs text-gray-600 text-center">Switch to a supported chain to continue.</p>`
            : ""
        }

        <div class="flex items-center justify-center pt-1">
          <a href="${ARC_FAUCET_URL}" target="_blank" rel="noopener noreferrer" class="text-xs text-gray-600 hover:text-indigo-400 transition-colors flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need testnet USDC? Visit faucet.circle.com
          </a>
        </div>
      </div>
    </div>
  `;

  const form = el.querySelector('[data-form="pay"]');
  form.addEventListener("submit", handlers.onSubmit);
  form.querySelector('[data-field="recipient"]').addEventListener("input", handlers.onRecipientInput);
  form.querySelector('[data-field="amount"]').addEventListener("input", handlers.onAmountInput);
}

export function renderTxStatus(el, state, handlers) {
  const status = state.payStatus;

  if (status.state === "idle") {
    el.innerHTML = "";
    return;
  }

  if (status.state === "pending") {
    el.innerHTML = `
      <div class="glass rounded-2xl p-5 border border-indigo-500/20 fade-in">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <div class="w-4 h-4 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin"></div>
          </div>
          <div>
            <p class="text-sm font-medium text-white">${status.message}</p>
            <p class="text-xs text-gray-600 mt-0.5">Cross-chain transfers take 1–3 minutes.</p>
          </div>
        </div>
        <div class="h-1 rounded-full bg-white/5 overflow-hidden">
          <div class="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 shimmer"></div>
        </div>
      </div>
    `;
    return;
  }

  if (status.state === "success") {
    el.innerHTML = `
      <div class="glass rounded-2xl p-5 border border-emerald-500/20 fade-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-emerald-400">Payment Confirmed</p>
            <p class="text-xs text-gray-500 mt-0.5">Successfully sent to Arc Testnet</p>
          </div>
        </div>

        <div class="bg-white/3 rounded-xl p-3 space-y-2 mb-4">
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-600">Amount</span>
            <span class="text-sm font-semibold font-mono text-white">${status.amount} USDC</span>
          </div>
          <div class="h-px bg-white/5"></div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-600">Recipient</span>
            <span class="text-sm font-mono text-gray-300">${shortenAddress(status.recipient)}</span>
          </div>
        </div>

        ${
          status.txHash
            ? `<div class="mb-4">
                <a href="${status.explorerUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2 transition-colors">
                  View on Arcscan: ${shortenAddress(status.txHash)}
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>`
            : ""
        }

        <button data-action="reset" class="w-full text-sm text-gray-500 hover:text-white transition-colors py-2 border border-white/5 hover:border-white/10 rounded-xl">
          Make another payment
        </button>
      </div>
    `;
    el.querySelector('[data-action="reset"]').addEventListener("click", handlers.onReset);
    return;
  }

  if (status.state === "error") {
    el.innerHTML = `
      <div class="glass rounded-2xl p-5 border border-red-500/20 fade-in">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-red-400">Payment Failed</p>
        </div>
        <p class="text-xs text-gray-500 break-words mb-4 leading-relaxed">${status.message}</p>
        <button data-action="reset" class="w-full text-sm font-medium text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-2.5 rounded-xl transition-colors">
          Try again
        </button>
      </div>
    `;
    el.querySelector('[data-action="reset"]').addEventListener("click", handlers.onReset);
  }
}

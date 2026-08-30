import {
  ARC_CHAIN_ID,
  ARC_FAUCET_URL,
  CHAIN_NAMES,
  SUPPORTED_SOURCE_CHAIN_IDS,
  ALL_SUPPORTED_CHAIN_IDS,
} from "./config.js";
import { shortenAddress } from "./utils.js";

const SPINNER = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>`;

// Neutral icon for every chain (kept deliberately monochrome — no per-chain
// brand colors — so magenta stays the app's one accent instead of a rainbow
// of chain colors competing with it).
function chainIcon(chainId, sizeClass = "w-5 h-5") {
  const letter = (CHAIN_NAMES[chainId] ?? "?").charAt(0);
  return `<span class="${sizeClass} rounded-full flex items-center justify-center text-[9px] font-bold text-gray-200 light:text-gray-800 bg-gray-700 light:bg-gray-200 border border-white/10 light:border-black/10 flex-shrink-0">${letter}</span>`;
}

// A MetaMask/Jumper-style chain picker: a button showing the selected chain's
// icon + name, opening a floating option list on click (not a native
// <select>, so it can be fully themed). Selection is wired separately via
// wirePickers() after the markup is inserted into the DOM.
function renderChainPicker({ pickerId, options, selectedId, disabled, placeholder }) {
  const selectedName = selectedId ? (CHAIN_NAMES[selectedId] ?? `Chain ${selectedId}`) : placeholder;
  return `
    <div class="relative" data-picker="${pickerId}">
      <button
        type="button"
        data-picker-toggle
        ${disabled ? "disabled" : ""}
        class="flex items-center gap-1.5 bg-white/5 light:bg-black/5 hover:bg-white/10 light:hover:bg-black/8 border border-white/10 light:border-black/10 rounded-lg pl-2 pr-2.5 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        ${selectedId ? chainIcon(selectedId) : `<span class="w-5 h-5 rounded-full border border-dashed border-gray-600 light:border-gray-300 flex-shrink-0"></span>`}
        <span class="text-sm font-medium ${selectedId ? "text-gray-200 light:text-gray-800" : "text-gray-500 light:text-gray-600"} whitespace-nowrap">${selectedName}</span>
        <svg class="w-3.5 h-3.5 text-gray-500 light:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div data-picker-panel hidden class="absolute left-0 z-30 mt-1.5 w-52 panel-solid rounded-xl overflow-hidden py-1 fade-in">
        ${options
          .map(
            (id) => `
              <button type="button" data-picker-option="${id}" class="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/8 light:hover:bg-black/6 transition-colors text-left">
                ${chainIcon(id)}
                <span class="text-sm text-gray-200 light:text-gray-800 flex-1">${CHAIN_NAMES[id]}</span>
                ${
                  id === selectedId
                    ? `<svg class="w-3.5 h-3.5 text-fuchsia-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`
                    : ""
                }
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

// Wires up every picker rendered by renderChainPicker() inside `el`: toggling
// the floating panel, closing others when one opens, closing on an outside
// click, and forwarding a selection to `onSelect(pickerId, chainId)`.
function wirePickers(el, onSelect) {
  el.querySelectorAll("[data-picker]").forEach((wrapper) => {
    const toggle = wrapper.querySelector("[data-picker-toggle]");
    const panel = wrapper.querySelector("[data-picker-panel]");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasOpen = !panel.hidden;
      el.querySelectorAll("[data-picker-panel]").forEach((p) => {
        p.hidden = true;
      });
      panel.hidden = wasOpen;
      if (!panel.hidden) {
        const closeOnOutside = (ev) => {
          if (!wrapper.contains(ev.target)) {
            panel.hidden = true;
            document.removeEventListener("click", closeOnOutside);
          }
        };
        setTimeout(() => document.addEventListener("click", closeOnOutside), 0);
      }
    });

    panel.querySelectorAll("[data-picker-option]").forEach((opt) => {
      opt.addEventListener("click", () => {
        panel.hidden = true;
        onSelect(wrapper.dataset.picker, Number(opt.dataset.pickerOption));
      });
    });
  });
}

// Deterministic per-address gradient, so a connected wallet gets a stable
// identicon-style swatch instead of a generic dot (matches how most wallet
// UIs — MetaMask, Rainbow — visually distinguish accounts).
function addressAvatarStyle(address) {
  let hash = 0;
  for (let i = 2; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `background: linear-gradient(135deg, hsl(${hue} 85% 62%), hsl(${(hue + 45) % 360} 85% 45%));`;
}

// Wires a single toggle+panel dropdown (not chain-picker specific): opens on
// toggle click, closes other open panels, closes on outside click.
function wireDropdown(container, toggleSelector, panelSelector) {
  const toggle = container.querySelector(toggleSelector);
  const panel = container.querySelector(panelSelector);
  if (!toggle || !panel) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasOpen = !panel.hidden;
    document.querySelectorAll("[data-picker-panel], [data-dropdown-panel]").forEach((p) => {
      p.hidden = true;
    });
    panel.hidden = wasOpen;
    if (!panel.hidden) {
      const closeOnOutside = (ev) => {
        if (!container.contains(ev.target)) {
          panel.hidden = true;
          document.removeEventListener("click", closeOnOutside);
        }
      };
      setTimeout(() => document.addEventListener("click", closeOnOutside), 0);
    }
  });
}

export function renderConnectButton(el, state, handlers) {
  if (state.address) {
    const gasText = state.gas.isLoading ? "…" : state.gas.formatted;
    const usdcText = state.usdc.isLoading ? "…" : state.usdc.formatted;

    el.innerHTML = `
      <div class="relative" data-dropdown="account">
        <button
          type="button"
          data-dropdown-toggle
          class="flex items-center gap-2 bg-white/5 light:bg-black/5 hover:bg-white/10 light:hover:bg-black/8 pl-1.5 pr-2.5 py-1.5 rounded-xl border border-white/10 light:border-black/10 transition-colors"
        >
          <span class="relative w-5 h-5 rounded-full flex-shrink-0" style="${addressAvatarStyle(state.address)}">
            <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-gray-950 light:border-white pulse-dot"></span>
          </span>
          <span class="text-sm text-gray-300 light:text-gray-700 font-mono">${shortenAddress(state.address)}</span>
          <svg class="w-3.5 h-3.5 text-gray-500 light:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div data-dropdown-panel hidden class="absolute right-0 z-30 mt-1.5 w-56 panel-solid rounded-xl overflow-hidden fade-in">
          <div class="px-3 py-3 border-b border-white/8 light:border-black/10">
            <p class="text-[10px] text-gray-600 light:text-gray-400 uppercase tracking-widest font-semibold mb-2">Arc Testnet Balance</p>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-500 light:text-gray-600">Gas USDC</span>
              <span class="font-mono text-gray-200 light:text-gray-800" data-balance="gas">${gasText}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-500 light:text-gray-600">ERC-20 USDC</span>
              <span class="font-mono text-gray-200 light:text-gray-800" data-balance="usdc">${usdcText}</span>
            </div>
          </div>
          <button data-action="disconnect" class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 light:text-gray-600 hover:text-red-400 hover:bg-white/5 light:hover:bg-black/5 transition-colors text-left">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Disconnect
          </button>
        </div>
      </div>
    `;
    wireDropdown(el, "[data-dropdown-toggle]", "[data-dropdown-panel]");
    el.querySelector('[data-action="disconnect"]').addEventListener("click", handlers.onDisconnect);
    return;
  }

  if (!state.hasWallet) {
    el.innerHTML = `<p class="text-sm text-gray-600 light:text-gray-400">Install MetaMask to continue.</p>`;
    return;
  }

  el.innerHTML = `
    <button
      data-action="connect"
      ${state.connecting ? "disabled" : ""}
      class="btn-gradient text-white light:text-gray-900 text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/20"
    >
      ${state.connecting ? `<span class="flex items-center gap-2">${SPINNER} Connecting</span>` : "Connect Wallet"}
    </button>
  `;
  el.querySelector('[data-action="connect"]').addEventListener("click", handlers.onConnect);
}

// Patches the account dropdown's balance figures in place, instead of a full
// renderConnectButton() re-render, so refreshing balances doesn't slam an
// open dropdown shut (a fresh innerHTML render always starts the panel
// hidden). No-op if the dropdown markup isn't present (wallet not connected).
export function updateConnectButtonBalances(el, state) {
  const gasEl = el.querySelector('[data-balance="gas"]');
  const usdcEl = el.querySelector('[data-balance="usdc"]');
  if (gasEl) gasEl.textContent = state.gas.isLoading ? "…" : state.gas.formatted;
  if (usdcEl) usdcEl.textContent = state.usdc.isLoading ? "…" : state.usdc.formatted;
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
        class="text-xs bg-white/5 light:bg-black/5 hover:bg-white/10 light:hover:bg-black/8 border border-white/10 light:border-black/10 text-gray-300 light:text-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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
          <p class="text-xs text-gray-500 light:text-gray-600 mb-3">Switch to a supported testnet to continue.</p>
          <div class="flex flex-wrap gap-1.5">
            ${chainButtons}
            <button
              data-switch-chain="${ARC_CHAIN_ID}"
              ${state.switching ? "disabled" : ""}
              class="text-xs bg-white/5 light:bg-black/5 hover:bg-white/10 light:hover:bg-black/8 border border-white/10 light:border-black/10 text-gray-300 light:text-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
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
        <p class="text-xs font-medium text-gray-500 light:text-gray-600 uppercase tracking-widest">
          Arc Testnet Balances
        </p>
        ${
          !hasGas
            ? `<a href="${ARC_FAUCET_URL}" target="_blank" rel="noopener noreferrer" class="text-xs text-gray-400 light:text-gray-600 hover:text-gray-200 light:hover:text-gray-800 transition-colors flex items-center gap-1">
                Get testnet USDC
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>`
            : ""
        }
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="relative bg-white/3 light:bg-black/4 border-l-2 ${hasGas ? "border-emerald-500/50" : "border-red-500/40"} rounded-xl p-3 overflow-hidden">
          <div class="flex items-center gap-1.5 mb-1.5">
            <svg class="w-3 h-3 text-gray-600 light:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 21H5a2 2 0 01-2-2V5a2 2 0 012-2h5.5M11 21l5-5m-5 5v-5h5m0 0V9a2 2 0 00-2-2h-1" />
            </svg>
            <p class="text-xs text-gray-600 light:text-gray-400">Gas USDC</p>
          </div>
          <p class="text-base font-semibold font-mono tabular-nums ${hasGas ? "text-emerald-400" : "text-red-400"}">${gasValue}</p>
          <p class="text-xs text-gray-700 light:text-gray-300 mt-0.5">native · 18 dec</p>
        </div>
        <div class="relative bg-white/3 light:bg-black/4 border-l-2 ${state.usdc.raw > 0n ? "border-emerald-500/50" : "border-white/10 light:border-black/10"} rounded-xl p-3 overflow-hidden">
          <div class="flex items-center gap-1.5 mb-1.5">
            <svg class="w-3 h-3 text-gray-600 light:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .672-3 1.5S10.343 11 12 11s3 .672 3 1.5-1.343 1.5-3 1.5m0-6c1.11 0 2.08.402 2.599 1M12 8V6.5M12 15v1.5m0-9C8.686 7.5 6 9.567 6 12s2.686 4.5 6 4.5 6-2.067 6-4.5-2.686-4.5-6-4.5z" />
            </svg>
            <p class="text-xs text-gray-600 light:text-gray-400">ERC-20 USDC</p>
          </div>
          <p class="text-base font-semibold font-mono tabular-nums ${state.usdc.raw > 0n ? "text-emerald-400" : "text-gray-500 light:text-gray-600"}">${usdcValue}</p>
          <p class="text-xs text-gray-700 light:text-gray-300 mt-0.5">token · 6 dec</p>
        </div>
      </div>
    </div>
  `;
}

export function renderXpDisplay(el, state) {
  if (!state.address) {
    el.innerHTML = "";
    return;
  }

  if (state.xpLoading || !state.xp) {
    el.innerHTML = `
      <div class="glass rounded-2xl p-4 mb-4 fade-in">
        <div class="shimmer h-4 w-28 rounded mb-3"></div>
        <div class="shimmer h-1.5 w-full rounded-full"></div>
      </div>
    `;
    return;
  }

  const info = state.xp;
  const progressPct = Math.round(info.progress * 100);
  const volume = Number(info.totalVolume).toLocaleString(undefined, { maximumFractionDigits: 2 });

  el.innerHTML = `
    <div class="glass rounded-2xl p-4 mb-4 fade-in">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-pink-500/20 border border-fuchsia-500/30 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-fuchsia-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-semibold text-white light:text-gray-900 leading-tight">${info.name}</p>
            <p class="text-xs text-gray-600 light:text-gray-400">Level ${info.level}</p>
          </div>
        </div>
        <p class="text-sm font-mono font-semibold text-fuchsia-300">${info.xp.toLocaleString()} XP</p>
      </div>
      <div class="h-1.5 rounded-full bg-white/5 light:bg-black/5 overflow-hidden mb-1.5">
        <div class="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500" style="width: ${progressPct}%"></div>
      </div>
      <div class="flex items-center justify-between text-xs text-gray-600 light:text-gray-400">
        <span>${
          info.isMaxLevel
            ? "Max level reached"
            : `${info.xpIntoLevel} / ${info.xpForNextLevel} XP to ${info.nextLevelName}`
        }</span>
        <span>${volume} USDC · ${info.txCount} tx</span>
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
        <div class="w-14 h-14 rounded-2xl bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 flex items-center justify-center mx-auto">
          <svg class="w-7 h-7 text-gray-400 light:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <p class="text-white light:text-gray-900 font-semibold mb-1">Connect your wallet</p>
          <p class="text-gray-600 light:text-gray-400 text-sm">Choose your wallet to start sending USDC cross-chain.</p>
        </div>
        <div class="space-y-2">
          ${
            state.hasWallet
              ? `<button data-action="connect" ${state.connecting ? "disabled" : ""} class="btn-gradient w-full text-white light:text-gray-900 font-semibold py-3 rounded-xl text-sm disabled:opacity-50 shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2">
                  ${
                    state.connecting
                      ? `${SPINNER} Connecting...`
                      : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Connect Wallet`
                  }
                </button>`
              : `<p class="text-sm text-gray-600 light:text-gray-400">No wallet detected. Install MetaMask to continue.</p>`
          }
        </div>
      </div>
    `;
    const btn = el.querySelector('[data-action="connect"]');
    if (btn) btn.addEventListener("click", handlers.onConnect);
    return;
  }

  const isSupportedChain = state.chainId ? ALL_SUPPORTED_CHAIN_IDS.includes(state.chainId) : false;
  const isPending = state.payStatus.state === "pending";
  const mode = state.mode === "swap" ? "swap" : "bridge";

  // In swap mode the destination is always whatever chain the wallet is on.
  // In bridge mode it's the independently-selected toChainId (never equal
  // to the current chain — that combination isn't offered in the picker).
  const toChainId = mode === "swap" ? state.chainId : state.toChainId;
  const toChainName = toChainId ? (CHAIN_NAMES[toChainId] ?? `Chain ${toChainId}`) : "—";
  const canSubmit = isSupportedChain && (mode === "swap" || (toChainId && toChainId !== state.chainId));

  const modeTabs = `
    <div class="flex gap-1 p-1 bg-white/3 light:bg-black/4 border border-white/8 light:border-black/10 rounded-xl">
      <button type="button" data-mode="bridge" class="flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${mode === "bridge" ? "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30" : "text-gray-500 light:text-gray-600 hover:text-gray-300 light:hover:text-gray-700 border border-transparent"}">
        Bridge
      </button>
      <button type="button" data-mode="swap" class="flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${mode === "swap" ? "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30" : "text-gray-500 light:text-gray-600 hover:text-gray-300 light:hover:text-gray-700 border border-transparent"}">
        Swap
      </button>
    </div>
  `;

  const fromPicker = renderChainPicker({
    pickerId: "from",
    options: ALL_SUPPORTED_CHAIN_IDS,
    selectedId: isSupportedChain ? state.chainId : null,
    disabled: state.switching,
    placeholder: "Unsupported network",
  });

  const toPicker = renderChainPicker({
    pickerId: "to",
    options: ALL_SUPPORTED_CHAIN_IDS.filter((id) => id !== state.chainId),
    selectedId: state.toChainId,
    disabled: false,
    placeholder: "Select network",
  });

  const flipButton = `
    <div class="flex justify-center -my-1.5 relative z-10">
      <button
        type="button"
        data-action="flip-chains"
        ${state.switching ? "disabled" : ""}
        title="Swap From/To"
        class="w-7 h-7 rounded-lg bg-gray-950 light:bg-gray-100 border border-white/10 light:border-black/10 hover:border-fuchsia-500/40 hover:text-fuchsia-300 text-gray-500 light:text-gray-600 flex items-center justify-center transition-colors disabled:opacity-40"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>
    </div>
  `;

  // Pancake/Jumper-style row: chain picker on the left, the actual input
  // (amount, or a recipient address) right-aligned on the right, in one box
  // — instead of a separate picker box and a separate input box.
  const fromRow = `
    <div class="bg-white/3 light:bg-black/4 border border-white/8 light:border-black/10 focus-within:border-fuchsia-500/40 rounded-xl p-3 transition-colors">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] text-gray-600 light:text-gray-400 uppercase tracking-widest font-semibold">From</span>
        <span class="text-[10px] text-gray-600 light:text-gray-400">
          Balance: ${state.fromBalance.isLoading ? "…" : state.fromBalance.formatted}
        </span>
      </div>
      <div class="flex items-center justify-between gap-3">
        ${fromPicker}
        <input
          type="number"
          name="amount"
          data-field="amount"
          value="${state.amount ?? ""}"
          placeholder="0.00"
          min="0"
          step="0.000001"
          ${isPending ? "disabled" : ""}
          class="flex-1 min-w-0 bg-transparent text-right text-xl font-semibold text-white light:text-gray-900 placeholder-gray-700 light:placeholder-gray-300 outline-none disabled:opacity-40"
        />
      </div>
      ${
        !state.fromBalance.isLoading && state.fromBalance.raw > 0n
          ? `<div class="flex justify-end mt-1.5">
              <button type="button" data-action="max-amount" ${isPending ? "disabled" : ""} class="text-[11px] font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors disabled:opacity-40">MAX</button>
            </div>`
          : ""
      }
    </div>
    <div data-error="amount">${errorMarkup(state.formErrors.amount)}</div>
  `;

  // Bridge mode: a matching "To" row (chain picker + recipient address).
  const toRow = `
    <div class="bg-white/3 light:bg-black/4 border border-white/8 light:border-black/10 focus-within:border-fuchsia-500/40 rounded-xl p-3 transition-colors">
      <span class="text-[10px] text-gray-600 light:text-gray-400 uppercase tracking-widest font-semibold block mb-2">To</span>
      <div class="flex items-center justify-between gap-3">
        ${toPicker}
        <input
          type="text"
          name="recipient"
          data-field="recipient"
          value="${state.recipient ?? ""}"
          placeholder="0x0000...0000"
          ${isPending ? "disabled" : ""}
          class="flex-1 min-w-0 bg-transparent text-right text-sm font-mono text-gray-100 light:text-gray-900 placeholder-gray-700 light:placeholder-gray-300 outline-none disabled:opacity-40"
        />
      </div>
    </div>
    <div data-error="recipient">${errorMarkup(state.formErrors.recipient)}</div>
  `;

  // Swap mode: no second chain to pick, so recipient is just its own field.
  const recipientBox = `
    <div class="bg-white/3 light:bg-black/4 border border-white/8 light:border-black/10 focus-within:border-fuchsia-500/40 rounded-xl p-3 transition-colors">
      <span class="text-[10px] text-gray-600 light:text-gray-400 uppercase tracking-widest font-semibold block mb-2">Recipient · ${toChainName}</span>
      <input
        type="text"
        name="recipient"
        data-field="recipient"
        value="${state.recipient ?? ""}"
        placeholder="0x0000...0000"
        ${isPending ? "disabled" : ""}
        class="w-full bg-transparent text-sm font-mono text-gray-100 light:text-gray-900 placeholder-gray-700 light:placeholder-gray-300 outline-none disabled:opacity-40"
      />
    </div>
    <div data-error="recipient">${errorMarkup(state.formErrors.recipient)}</div>
  `;

  const payForm = `
    <form data-form="pay" class="space-y-3">
      ${fromRow}

      ${
        mode === "bridge"
          ? `${flipButton}${toRow}`
          : `${
              isSupportedChain
                ? `<div class="flex items-center gap-2 bg-white/5 light:bg-black/5 border border-white/10 light:border-black/10 rounded-xl px-3 py-2.5">
                    <svg class="w-4 h-4 text-gray-400 light:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-xs text-gray-400 light:text-gray-600">On ${toChainName} — sending same-chain USDC.</p>
                  </div>`
                : ""
            }${recipientBox}`
      }

      <p class="text-[11px] text-gray-600 light:text-gray-400 text-center">
        ${mode === "swap" ? "Instant · same-chain transfer" : "Est. arrival 1–3 min · Circle CCTP"}
      </p>

      <button
        type="submit"
        ${isPending || !canSubmit ? "disabled" : ""}
        class="btn-gradient w-full text-white light:text-gray-900 font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-fuchsia-500/20"
      >
        ${
          isPending
            ? `<span class="flex items-center justify-center gap-2">${SPINNER} Processing...</span>`
            : !isSupportedChain
              ? "Unsupported Network"
              : mode === "swap"
                ? `<span class="flex items-center justify-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" /></svg> Swap USDC</span>`
                : `<span class="flex items-center justify-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Bridge to ${toChainName}</span>`
        }
      </button>
    </form>
  `;

  el.innerHTML = `
    <div class="space-y-3 fade-in">
      <div class="glass gradient-ring rounded-2xl p-5 space-y-3">
        ${modeTabs}

        ${
          !isSupportedChain
            ? `<p class="text-xs text-amber-400/80 text-center">Pick a chain below to switch your wallet to it.</p>`
            : ""
        }

        ${payForm}

        <div class="flex items-center justify-center pt-1">
          <a href="${ARC_FAUCET_URL}" target="_blank" rel="noopener noreferrer" class="text-xs text-gray-600 light:text-gray-400 hover:text-gray-300 light:hover:text-gray-700 transition-colors flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need testnet USDC? Visit faucet.circle.com
          </a>
        </div>
      </div>
    </div>
  `;

  el.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => handlers.onSelectMode(btn.dataset.mode));
  });

  wirePickers(el, (pickerId, chainId) => {
    if (pickerId === "from") handlers.onSwitchChain(chainId);
    else if (pickerId === "to") handlers.onSelectToChain(chainId);
  });

  const flipBtn = el.querySelector('[data-action="flip-chains"]');
  if (flipBtn) flipBtn.addEventListener("click", handlers.onFlipChains);

  const form = el.querySelector('[data-form="pay"]');
  if (form) {
    form.addEventListener("submit", handlers.onSubmit);
    form.querySelector('[data-field="recipient"]').addEventListener("input", handlers.onRecipientInput);
    form.querySelector('[data-field="amount"]').addEventListener("input", handlers.onAmountInput);
    const maxBtn = form.querySelector('[data-action="max-amount"]');
    if (maxBtn) maxBtn.addEventListener("click", handlers.onMaxAmount);
  }
}

export function renderTxStatus(el, state, handlers) {
  const status = state.payStatus;

  if (status.state === "idle") {
    el.innerHTML = "";
    return;
  }

  if (status.state === "pending") {
    el.innerHTML = `
      <div class="glass rounded-2xl p-5 border border-fuchsia-500/20 fade-in">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-xl bg-fuchsia-500/10 flex items-center justify-center flex-shrink-0">
            <div class="w-4 h-4 border-2 border-fuchsia-400/40 border-t-fuchsia-400 rounded-full animate-spin"></div>
          </div>
          <div>
            <p class="text-sm font-medium text-white light:text-gray-900">${status.message}</p>
            <p class="text-xs text-gray-600 light:text-gray-400 mt-0.5">Cross-chain transfers take 1–3 minutes.</p>
          </div>
        </div>
        <div class="h-1 rounded-full bg-white/5 light:bg-black/5 overflow-hidden">
          <div class="h-full w-1/3 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 shimmer"></div>
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
            <p class="text-xs text-gray-500 light:text-gray-600 mt-0.5">Successfully sent to Arc Testnet</p>
          </div>
        </div>

        <div class="bg-white/3 light:bg-black/4 rounded-xl p-3 space-y-2 mb-4">
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-600 light:text-gray-400">Amount</span>
            <span class="text-sm font-semibold font-mono text-white light:text-gray-900">${status.amount} USDC</span>
          </div>
          <div class="h-px bg-white/5 light:bg-black/5"></div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-600 light:text-gray-400">Recipient</span>
            <span class="text-sm font-mono text-gray-300 light:text-gray-700">${shortenAddress(status.recipient)}</span>
          </div>
        </div>

        ${
          status.txHash
            ? `<div class="mb-4">
                <a href="${status.explorerUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-fuchsia-400 hover:text-fuchsia-300 text-sm underline underline-offset-2 transition-colors">
                  View on Arcscan: ${shortenAddress(status.txHash)}
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>`
            : ""
        }

        <button data-action="reset" class="w-full text-sm text-gray-500 light:text-gray-600 hover:text-white light:hover:text-gray-900 transition-colors py-2 border border-white/5 light:border-black/8 hover:border-white/10 light:hover:border-black/15 rounded-xl">
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
        <p class="text-xs text-gray-500 light:text-gray-600 break-words mb-4 leading-relaxed">${status.message}</p>
        <button data-action="reset" class="w-full text-sm font-medium text-white light:text-gray-900 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 py-2.5 rounded-xl transition-colors">
          Try again
        </button>
      </div>
    `;
    el.querySelector('[data-action="reset"]').addEventListener("click", handlers.onReset);
  }
}

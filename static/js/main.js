import {
  hasInjectedWallet,
  getAccounts,
  connect,
  getChainId,
  switchChain,
  onAccountsChanged,
  onChainChanged,
} from "./wallet.js";
import { getNativeBalance, getUsdcBalance, getUsdcBalanceOnChain } from "./rpc.js";
import { formatNativeUsdcBalance, formatUsdcBalance, formatUsdcAmountPlain, isAddress } from "./utils.js";
import { ARC_CHAIN_ID, ALL_SUPPORTED_CHAIN_IDS } from "./config.js";
import { pay } from "./pay.js";
import { fetchActivity, recordActivity } from "./xp.js";
import { getTheme, toggleTheme } from "./theme.js";
import {
  renderConnectButton,
  updateConnectButtonBalances,
  renderNetworkGuard,
  renderBalanceDisplay,
  renderXpDisplay,
  renderPaymentForm,
  renderTxStatus,
} from "./ui.js";

const el = {
  connectButton: document.getElementById("connect-button"),
  networkGuard: document.getElementById("network-guard"),
  balanceDisplay: document.getElementById("balance-display"),
  xpDisplay: document.getElementById("xp-display"),
  paymentForm: document.getElementById("payment-form"),
  txStatus: document.getElementById("tx-status"),
};

const emptyBalance = { raw: 0n, formatted: "—", isLoading: false };

const state = {
  hasWallet: hasInjectedWallet(),
  address: null,
  chainId: null,
  connecting: false,
  switching: false,
  gas: { ...emptyBalance },
  usdc: { ...emptyBalance },
  // USDC balance on whichever chain is currently selected as the bridge/swap
  // source — shown next to the amount field with a MAX shortcut. Distinct
  // from `usdc` above, which is always Arc's balance regardless of mode.
  fromBalance: { ...emptyBalance },
  mode: "bridge",
  // Independently-selected bridge destination (swap mode always targets
  // whatever chain the wallet is currently on instead). Defaults to Arc,
  // ArcConnect's original purpose, but any supported chain can be picked.
  toChainId: ARC_CHAIN_ID,
  recipient: "",
  amount: "",
  formErrors: {},
  payStatus: { state: "idle" },
  xp: null,
  xpLoading: false,
};

function renderAll() {
  renderConnectButton(el.connectButton, state, handlers);
  renderNetworkGuard(el.networkGuard, state, handlers);
  renderBalanceDisplay(el.balanceDisplay, state);
  renderXpDisplay(el.xpDisplay, state);
  renderPaymentForm(el.paymentForm, state, handlers);
  renderTxStatus(el.txStatus, state, handlers);
}

async function refreshXp() {
  if (!state.address) {
    state.xp = null;
    state.xpLoading = false;
    renderXpDisplay(el.xpDisplay, state);
    return;
  }

  state.xpLoading = true;
  renderXpDisplay(el.xpDisplay, state);
  try {
    state.xp = await fetchActivity(state.address);
  } catch (err) {
    console.error("Failed to load wallet XP:", err);
  } finally {
    state.xpLoading = false;
    renderXpDisplay(el.xpDisplay, state);
  }
}

async function refreshBalances() {
  if (!state.address) {
    state.gas = { ...emptyBalance };
    state.usdc = { ...emptyBalance };
    renderBalanceDisplay(el.balanceDisplay, state);
    updateConnectButtonBalances(el.connectButton, state);
    return;
  }

  state.gas = { ...state.gas, isLoading: true };
  state.usdc = { ...state.usdc, isLoading: true };
  renderBalanceDisplay(el.balanceDisplay, state);
  updateConnectButtonBalances(el.connectButton, state);

  try {
    const [gasRaw, usdcRaw] = await Promise.all([
      getNativeBalance(state.address),
      getUsdcBalance(state.address),
    ]);
    state.gas = { raw: gasRaw, formatted: formatNativeUsdcBalance(gasRaw), isLoading: false };
    state.usdc = { raw: usdcRaw, formatted: formatUsdcBalance(usdcRaw), isLoading: false };
  } catch (err) {
    console.error("Failed to load Arc Testnet balances:", err);
    state.gas = { ...state.gas, isLoading: false };
    state.usdc = { ...state.usdc, isLoading: false };
  }
  renderBalanceDisplay(el.balanceDisplay, state);
  updateConnectButtonBalances(el.connectButton, state);
}

async function refreshFromBalance() {
  if (!state.address || !state.chainId) {
    state.fromBalance = { ...emptyBalance };
    renderPaymentForm(el.paymentForm, state, handlers);
    return;
  }

  state.fromBalance = { ...state.fromBalance, isLoading: true };
  renderPaymentForm(el.paymentForm, state, handlers);

  try {
    const raw = await getUsdcBalanceOnChain(state.chainId, state.address);
    state.fromBalance =
      raw !== null ? { raw, formatted: formatUsdcBalance(raw), isLoading: false } : { ...emptyBalance };
  } catch (err) {
    console.error("Failed to load source-chain USDC balance:", err);
    state.fromBalance = { ...state.fromBalance, isLoading: false };
  }
  renderPaymentForm(el.paymentForm, state, handlers);
}

// A bridge destination equal to the current chain isn't offered in the "To"
// dropdown — if the wallet's chain changes to match it, fall back to the
// next supported chain so state.toChainId always stays a valid pick.
function ensureValidToChain() {
  if (state.toChainId !== state.chainId) return;
  state.toChainId = ALL_SUPPORTED_CHAIN_IDS.find((id) => id !== state.chainId) ?? null;
}

function validate() {
  const errs = {};
  if (!isAddress(state.recipient)) errs.recipient = "Enter a valid 0x address.";
  const parsed = parseFloat(state.amount);
  if (!state.amount || Number.isNaN(parsed) || parsed <= 0) {
    errs.amount = "Enter an amount greater than 0.";
  }
  state.formErrors = errs;
  return Object.keys(errs).length === 0;
}

const handlers = {
  async onConnect() {
    state.connecting = true;
    renderAll();
    try {
      const accounts = await connect();
      state.address = accounts[0] ?? null;
      state.chainId = state.address ? await getChainId() : null;
      ensureValidToChain();
    } catch (err) {
      console.error("Wallet connect failed:", err);
    } finally {
      state.connecting = false;
      renderAll();
      await Promise.all([refreshBalances(), refreshXp(), refreshFromBalance()]);
    }
  },

  onDisconnect() {
    state.address = null;
    state.chainId = null;
    state.payStatus = { state: "idle" };
    state.xp = null;
    refreshBalances();
    refreshFromBalance();
    renderAll();
  },

  onSelectMode(mode) {
    state.mode = mode === "swap" ? "swap" : "bridge";
    state.formErrors = {};
    renderPaymentForm(el.paymentForm, state, handlers);
  },

  onSelectToChain(chainId) {
    state.toChainId = chainId;
    renderPaymentForm(el.paymentForm, state, handlers);
  },

  onMaxAmount() {
    if (!state.fromBalance.raw || state.fromBalance.raw <= 0n) return;
    state.amount = formatUsdcAmountPlain(state.fromBalance.raw);
    if (state.formErrors.amount) {
      state.formErrors = { ...state.formErrors, amount: undefined };
    }
    renderPaymentForm(el.paymentForm, state, handlers);
  },

  // Swaps From and To: switches the wallet to the current "to" chain, and
  // sets the new "to" back to whatever chain we were just on.
  async onFlipChains() {
    if (state.mode !== "bridge" || !state.toChainId || !state.chainId) return;
    const desiredTo = state.chainId;
    await handlers.onSwitchChain(state.toChainId);
    state.toChainId = desiredTo;
    renderPaymentForm(el.paymentForm, state, handlers);
  },

  async onSwitchChain(chainId) {
    state.switching = true;
    renderAll();
    try {
      await switchChain(chainId);
      state.chainId = await getChainId();
      ensureValidToChain();
    } catch (err) {
      console.error("Chain switch failed:", err);
    } finally {
      state.switching = false;
      renderAll();
      refreshFromBalance();
    }
  },

  onRecipientInput(e) {
    state.recipient = e.target.value;
    if (state.formErrors.recipient) {
      state.formErrors = { ...state.formErrors, recipient: undefined };
      el.paymentForm.querySelector('[data-error="recipient"]').innerHTML = "";
    }
  },

  onAmountInput(e) {
    state.amount = e.target.value;
    if (state.formErrors.amount) {
      state.formErrors = { ...state.formErrors, amount: undefined };
      el.paymentForm.querySelector('[data-error="amount"]').innerHTML = "";
    }
  },

  async onSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      renderPaymentForm(el.paymentForm, state, handlers);
      return;
    }
    const recordedKind = state.mode;
    const recordedAddress = state.address;
    const fromChainId = state.chainId;
    const toChainId = state.mode === "swap" ? state.chainId : state.toChainId;
    await pay(state.recipient, state.amount, fromChainId, toChainId, (status) => {
      state.payStatus = status;
      renderPaymentForm(el.paymentForm, state, handlers);
      renderTxStatus(el.txStatus, state, handlers);

      if (status.state === "success") {
        recordActivity({
          address: recordedAddress,
          amount: status.amount,
          txHash: status.txHash,
          kind: recordedKind,
        })
          .then((updated) => {
            state.xp = updated;
            renderXpDisplay(el.xpDisplay, state);
          })
          .catch((err) => console.error("Failed to record wallet XP:", err));
      }
    });
  },

  onReset() {
    state.payStatus = { state: "idle" };
    renderPaymentForm(el.paymentForm, state, handlers);
    renderTxStatus(el.txStatus, state, handlers);
  },
};

async function init() {
  if (state.hasWallet) {
    const accounts = await getAccounts();
    state.address = accounts[0] ?? null;
    state.chainId = state.address ? await getChainId() : null;
    ensureValidToChain();

    onAccountsChanged(async (accounts) => {
      state.address = accounts[0] ?? null;
      state.chainId = state.address ? await getChainId() : null;
      ensureValidToChain();
      state.payStatus = { state: "idle" };
      state.xp = null;
      renderAll();
      await Promise.all([refreshBalances(), refreshXp(), refreshFromBalance()]);
    });

    onChainChanged((hexChainId) => {
      state.chainId = parseInt(hexChainId, 16);
      ensureValidToChain();
      renderAll();
      refreshFromBalance();
    });
  }

  renderAll();
  await Promise.all([refreshBalances(), refreshXp(), refreshFromBalance()]);
}

function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  const darkIcon = document.getElementById("theme-icon-dark");
  const lightIcon = document.getElementById("theme-icon-light");
  if (!toggleBtn || !darkIcon || !lightIcon) return;

  function syncIcon() {
    const isLight = getTheme() === "light";
    darkIcon.classList.toggle("hidden", isLight);
    lightIcon.classList.toggle("hidden", !isLight);
  }

  syncIcon();
  toggleBtn.addEventListener("click", () => {
    toggleTheme();
    syncIcon();
  });
}

initThemeToggle();
init();

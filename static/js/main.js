import {
  hasInjectedWallet,
  getAccounts,
  connect,
  getChainId,
  switchChain,
  onAccountsChanged,
  onChainChanged,
} from "./wallet.js";
import { getNativeBalance, getUsdcBalance } from "./rpc.js";
import { formatNativeUsdcBalance, formatUsdcBalance, isAddress } from "./utils.js";
import { pay } from "./pay.js";
import {
  renderConnectButton,
  renderNetworkGuard,
  renderBalanceDisplay,
  renderPaymentForm,
  renderTxStatus,
} from "./ui.js";

const el = {
  connectButton: document.getElementById("connect-button"),
  networkGuard: document.getElementById("network-guard"),
  balanceDisplay: document.getElementById("balance-display"),
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
  recipient: "",
  amount: "",
  formErrors: {},
  payStatus: { state: "idle" },
};

function renderAll() {
  renderConnectButton(el.connectButton, state, handlers);
  renderNetworkGuard(el.networkGuard, state, handlers);
  renderBalanceDisplay(el.balanceDisplay, state);
  renderPaymentForm(el.paymentForm, state, handlers);
  renderTxStatus(el.txStatus, state, handlers);
}

async function refreshBalances() {
  if (!state.address) {
    state.gas = { ...emptyBalance };
    state.usdc = { ...emptyBalance };
    renderBalanceDisplay(el.balanceDisplay, state);
    return;
  }

  state.gas = { ...state.gas, isLoading: true };
  state.usdc = { ...state.usdc, isLoading: true };
  renderBalanceDisplay(el.balanceDisplay, state);

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
    } catch (err) {
      console.error("Wallet connect failed:", err);
    } finally {
      state.connecting = false;
      renderAll();
      await refreshBalances();
    }
  },

  onDisconnect() {
    state.address = null;
    state.chainId = null;
    state.payStatus = { state: "idle" };
    refreshBalances();
    renderAll();
  },

  async onSwitchChain(chainId) {
    state.switching = true;
    renderAll();
    try {
      await switchChain(chainId);
      state.chainId = await getChainId();
    } catch (err) {
      console.error("Chain switch failed:", err);
    } finally {
      state.switching = false;
      renderAll();
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
    await pay(state.recipient, state.amount, state.chainId, (status) => {
      state.payStatus = status;
      renderPaymentForm(el.paymentForm, state, handlers);
      renderTxStatus(el.txStatus, state, handlers);
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

    onAccountsChanged(async (accounts) => {
      state.address = accounts[0] ?? null;
      state.chainId = state.address ? await getChainId() : null;
      state.payStatus = { state: "idle" };
      renderAll();
      await refreshBalances();
    });

    onChainChanged((hexChainId) => {
      state.chainId = parseInt(hexChainId, 16);
      renderAll();
    });
  }

  renderAll();
  await refreshBalances();
}

init();

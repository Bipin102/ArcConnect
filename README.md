# ArcConnect

**One-Click Cross-Chain USDC Pay on Arc Testnet**

ArcConnect lets you send USDC from any supported testnet chain directly to any Arc Testnet address in a single click — no manual bridging, no extra steps. Powered by Circle App Kit and built on Arc, the first Layer-1 blockchain where USDC is the native gas token.

Django + Jinja2 + Tailwind CSS, with a vanilla-JS client (no React, no bundler) handling wallet connection and the cross-chain bridge.

---

## What It Does

- Connect a wallet on any supported testnet chain
- Enter a recipient Arc Testnet address and USDC amount
- Click **Pay** — Circle App Kit handles the cross-chain bridge automatically
- View the confirmed transaction on Arcscan

If you are already on Arc Testnet, it sends USDC same-chain instantly.

---

## Supported Source Chains

| Chain | Network |
|---|---|
| Ethereum Sepolia | Testnet |
| Base Sepolia | Testnet |
| Arbitrum Sepolia | Testnet |
| Avalanche Fuji | Testnet |
| Arc Testnet | Testnet (same-chain send) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5, Jinja2 templates |
| Styling | Tailwind CSS v4 |
| Client | Vanilla JS (ES modules), no bundler |
| Wallet | Raw EIP-1193 (`window.ethereum`) — injected wallets only |
| Cross-chain | Circle App Kit (`@circle-fin/app-kit`), loaded from `esm.sh` at pay-time |
| Chain | Arc Testnet (Chain ID: 5042002) |

---

## Arc Testnet Details

| Field | Value |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Gas token | USDC (not ETH) |
| Native USDC decimals | 18 |
| ERC-20 USDC decimals | 6 |
| USDC contract | `0x3600000000000000000000000000000000000000` |

---

## Why this isn't a pure server-rendered app

Wallet connection, chain switching, balance reads, and the actual bridge/send transaction all require signing through the user's browser wallet (MetaMask) and Circle App Kit, a JavaScript-only SDK. None of that can run in Python. So:

- **Django** serves the page, holds the canonical config (chain IDs, RPC URL, USDC address, decimals — see [pay/constants.py](pay/constants.py)) and injects it into the page as JSON.
- **A hand-written vanilla-JS module** ([static/js/](static/js/), no React, no bundler) does the wallet work in the browser, loading Circle App Kit and its viem adapter straight from a CDN (`esm.sh`) as ES modules when a payment is submitted.

**Deliberate scope cuts:**
- Injected wallets only (MetaMask, etc.) — WalletConnect was dropped.
- Recipient-address validation is a regex instead of viem's `isAddress`, and balance reads use hand-rolled `eth_call`/`eth_getBalance` JSON-RPC instead of viem, so the only CDN dependency is Circle App Kit itself.

---

## Run Locally

**1. Clone the repo**

```bash
git clone https://github.com/Bipin102/ArcConnect.git
cd ArcConnect
```

**2. Set up a virtual environment and install dependencies**

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

**3. Start the dev server**

```bash
.venv/bin/python manage.py runserver
```

Open [http://localhost:8000](http://localhost:8000)

---

## Rebuilding Tailwind CSS

`static/css/output.css` is a committed, compiled artifact — you only need to rebuild it after editing `static/src/input.css` or adding Tailwind classes to a template/JS file the `@source` directives in `input.css` don't already cover.

The Tailwind CLI resolves `tailwindcss` via normal Node module resolution, so it needs a `node_modules` next to the input file. This project has none checked in, so build from a scratch install and point the CLI at the real files:

```bash
mkdir -p /tmp/tw-build && cd /tmp/tw-build
npm init -y && npm install --no-save tailwindcss@latest @tailwindcss/cli@latest

cd /path/to/ArcConnect
ln -s /tmp/tw-build/node_modules node_modules
/tmp/tw-build/node_modules/.bin/tailwindcss -i static/src/input.css -o static/css/output.css --minify
rm node_modules   # remove the symlink — nothing Node-related should persist here
```

No Node.js is required to *run* the app — only to rebuild this one CSS file after a style change.

---

## How to Use

1. Open the app and click **Connect Wallet** (MetaMask or another injected wallet)
2. Switch to a supported testnet chain (e.g. Base Sepolia)
3. Get testnet USDC at [faucet.circle.com](https://faucet.circle.com)
4. Enter a recipient Arc Testnet address and USDC amount
5. Click **Pay** and approve the transaction in your wallet
6. Wait 1–3 minutes for the cross-chain bridge to complete
7. View the confirmed transaction on Arcscan

---

## Project Structure

```
├── arcconnect/             # Django project (settings, urls, Jinja2 env)
├── pay/                    # Django app: views, urls, chain/contract constants
├── templates/
│   ├── base.html           # Root layout
│   └── pay/index.html      # Main page — static containers JS renders into
└── static/
    ├── src/input.css       # Tailwind source
    ├── css/output.css      # Compiled Tailwind (committed)
    ├── img/                # Logo
    └── js/
        ├── config.js       # Reads server-injected config JSON
        ├── utils.js        # Formatting helpers, address shortener
        ├── rpc.js          # Balance reads via raw JSON-RPC (no viem)
        ├── wallet.js        # Connect / switch chain via window.ethereum
        ├── pay.js           # Circle App Kit bridge/send logic
        ├── ui.js            # DOM render functions per screen region
        └── main.js          # Entry point — wires state, events, and renders
```

---

## Key Design Decisions

**USDC as gas** — Arc uses USDC as the native gas token, not ETH. The app displays both native gas USDC (18 decimals) and ERC-20 USDC (6 decimals) separately to avoid confusion.

**One-click UX** — Circle App Kit's bridge handles attestation, relaying, and minting behind the scenes. The user signs once and waits.

**Same-chain fallback** — If the user is already on Arc Testnet, the app uses `kit.send()` instead of `kit.bridge()` for instant same-chain transfers.

---

## Verified

`python manage.py check` passes; the page was smoke-tested with a headless browser (connect/disconnect, unsupported-network banner, the `wallet_addEthereumChain` fallback for Arc Testnet, balance reads against the live Arc Testnet RPC, and form validation) with zero console errors. The actual cross-chain bridge (`pay.js` → Circle App Kit) needs a real wallet extension and hasn't been exercised end-to-end — test that manually with MetaMask before relying on it.

---

## Built With

- [Arc](https://docs.arc.io) — Layer-1 blockchain by Circle
- [Circle App Kit](https://docs.arc.io/app-kit) — Cross-chain USDC operations
- [Django](https://www.djangoproject.com) — Python web framework
- [Tailwind CSS](https://tailwindcss.com) — Styling

---

## License

MIT

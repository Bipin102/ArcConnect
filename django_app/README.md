# ArcConnect (Django)

Django + Jinja2 + Tailwind port of the ArcConnect Next.js app in the parent
directory. Same product: one-click cross-chain USDC pay to Arc Testnet.

## Why this isn't a pure server-rendered app

Wallet connection, chain switching, balance reads, and the actual
bridge/send transaction all require signing through the user's browser
wallet (MetaMask) and Circle App Kit, a JavaScript-only SDK. None of that
can run in Python. So:

- **Django** serves the page, holds the canonical config (chain IDs, RPC
  URL, USDC address, decimals — see `pay/constants.py`) and injects it into
  the page as JSON.
- **A hand-written vanilla-JS module** (`static/js/`, no React, no bundler)
  does the wallet work in the browser, loading Circle App Kit and its viem
  adapter straight from a CDN (`esm.sh`) as ES modules when a payment is
  submitted.

This mirrors the original `hooks/`/`components/` 1:1 — see the module
comments in `static/js/*.js` for the mapping.

**Differences from the Next.js version** (both were deliberate scope cuts,
not oversights):
- Injected wallets only (MetaMask, etc.) — WalletConnect was dropped.
- Recipient-address validation is a regex instead of viem's `isAddress`,
  and balance reads use hand-rolled `eth_call`/`eth_getBalance` JSON-RPC
  instead of viem, so the only CDN dependency is Circle App Kit itself.

## Setup

```bash
cd django_app
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py runserver
```

Open http://localhost:8000/.

## Rebuilding Tailwind CSS

`static/css/output.css` is a committed, compiled artifact — you only need
to rebuild it after editing `static/src/input.css` or adding Tailwind
classes to a template/JS file the `@source` directives in `input.css`
don't already cover.

The Tailwind CLI resolves `tailwindcss` via normal Node module resolution,
so it needs a `node_modules` next to the input file. This project has none
checked in, so build from a scratch install and point the CLI at the real
files:

```bash
mkdir -p /tmp/tw-build && cd /tmp/tw-build
npm init -y && npm install --no-save tailwindcss@latest @tailwindcss/cli@latest

cd /path/to/django_app
ln -s /tmp/tw-build/node_modules node_modules
/tmp/tw-build/node_modules/.bin/tailwindcss -i static/src/input.css -o static/css/output.css --minify
rm node_modules   # remove the symlink — nothing Node-related should persist here
```

No Node.js is required to *run* the app — only to rebuild this one CSS
file after a style change.

## Verified

`python manage.py check` passes; the page was smoke-tested with a headless
browser (connect/disconnect, unsupported-network banner, the
`wallet_addEthereumChain` fallback for Arc Testnet, balance reads against
the live Arc Testnet RPC, and form validation) with zero console errors.
The actual cross-chain bridge (`pay.js` → Circle App Kit) needs a real
wallet extension and hasn't been exercised end-to-end — test that manually
with MetaMask before relying on it.

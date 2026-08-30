# ArcConnect

**One-Click Cross-Chain USDC Pay on Arc Testnet**

ArcConnect lets you send USDC from any supported testnet chain directly to any Arc Testnet address in a single click — no manual bridging, no extra steps. Powered by Circle App Kit and built on Arc, the first Layer-1 blockchain where USDC is the native gas token.

**Live Demo:** [arcconnect.vercel.app](https://arcconnect.vercel.app)

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
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Wallet | Wagmi v3, Viem v2 |
| Cross-chain | Circle App Kit (`@circle-fin/app-kit`) |
| Adapter | `@circle-fin/adapter-viem-v2` |
| Chain | Arc Testnet (Chain ID: 5042002) |
| Deployment | Vercel |

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

## Run Locally

**1. Clone the repo**

```bash
git clone https://github.com/Bipin102/ArcConnect.git
cd ArcConnect
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Add your WalletConnect project ID (free at [cloud.walletconnect.com](https://cloud.walletconnect.com)):

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How to Use

1. Open [arcconnect.vercel.app](https://arcconnect.vercel.app)
2. Click **Connect Wallet** (MetaMask or injected wallet)
3. Switch to a supported testnet chain (e.g. Base Sepolia)
4. Get testnet USDC at [faucet.circle.com](https://faucet.circle.com)
5. Enter a recipient Arc Testnet address and USDC amount
6. Click **Pay** and approve the transaction in your wallet
7. Wait 1–3 minutes for the cross-chain bridge to complete
8. View the confirmed transaction on Arcscan

---

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page
│   └── providers.tsx       # Wagmi + QueryClient providers
├── components/
│   ├── ConnectButton.tsx   # Wallet connect / disconnect
│   ├── NetworkGuard.tsx    # Wrong chain warning + switch
│   ├── BalanceDisplay.tsx  # Gas USDC + ERC-20 USDC balances
│   ├── PaymentForm.tsx     # Recipient + amount form
│   ├── TxStatus.tsx        # Pending / success / error states
│   ├── FaucetLink.tsx      # Link to Circle faucet
│   └── ExplorerLink.tsx    # Arcscan transaction link
├── hooks/
│   ├── usePay.ts           # Core bridge + send logic
│   ├── useUsdcBalance.ts   # ERC-20 USDC balance (6 dec)
│   └── useArcBalance.ts    # Native gas USDC balance (18 dec)
└── lib/
    ├── arcChain.ts         # Viem chain definition for Arc Testnet
    ├── wagmiConfig.ts      # Wagmi config
    ├── constants.ts        # Addresses, chain IDs, decimals
    └── utils.ts            # Format helpers, address shortener
```

---

## Key Design Decisions

**USDC as gas** — Arc uses USDC as the native gas token, not ETH. The app displays both native gas USDC (18 decimals) and ERC-20 USDC (6 decimals) separately to avoid confusion.

**One-click UX** — Circle App Kit's bridge handles attestation, relaying, and minting behind the scenes. The user signs once and waits.

**Same-chain fallback** — If the user is already on Arc Testnet, the app uses `kit.send()` instead of `kit.bridge()` for instant same-chain transfers.

---

## Built With

- [Arc](https://docs.arc.io) — Layer-1 blockchain by Circle
- [Circle App Kit](https://docs.arc.io/app-kit) — Cross-chain USDC operations
- [Wagmi](https://wagmi.sh) — React hooks for Ethereum
- [Viem](https://viem.sh) — TypeScript Ethereum library
- [Next.js](https://nextjs.org) — React framework
- [Vercel](https://vercel.com) — Deployment

---

## License

MIT

# ArcConnect Contracts

`ArcConnectReceipts` — a lightweight, non-custodial receipt log for
ArcConnect payments settled via Circle's CCTP bridge or a direct
same-chain USDC transfer. It never holds funds; it only records a
tamper-evident receipt (sender, recipient, amount, source chain, time)
after the real transfer has already settled, keyed by a caller-chosen
reference id (e.g. the settlement transaction hash).

Deployed on Arc Testnet at
[`0x3acCe2Ae4563e4802473173Ed70e29020DC4bb0a`](https://testnet.arcscan.app/address/0x3acCe2Ae4563e4802473173Ed70e29020DC4bb0a),
and wired into the app — the "Record on-chain receipt" button on a
successful payment calls it directly (see `hooks/useRecordReceipt.ts`).

## Setup

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
git submodule update --init --recursive
```

Copy `.env.example` to `.env` and fill in your own testnet-only
private key. **Never commit `.env`.**

## Test

```bash
forge test -vv
```

## Deploy to Arc Testnet

Fund your deployer address with testnet USDC first — Arc uses USDC as
gas, not ETH: https://faucet.circle.com (select Arc Testnet).

```bash
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$ARC_TESTNET_RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

## Verify on Arcscan

```bash
forge verify-contract <DEPLOYED_ADDRESS> src/ArcConnectReceipts.sol:ArcConnectReceipts \
  --chain-id 5042002 \
  --verifier blockscout \
  --verifier-url https://testnet.arcscan.app/api/
```

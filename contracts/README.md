# ArcConnect Contracts

`ArcConnectReceipts` — a lightweight, non-custodial receipt log for
ArcConnect payments settled via Circle's CCTP bridge or a direct
same-chain USDC transfer. It never holds funds; it only records a
tamper-evident receipt (sender, recipient, amount, source chain, time)
after the real transfer has already settled, keyed by a caller-chosen
reference id (e.g. the settlement transaction hash).

## Setup

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge install foundry-rs/forge-std --no-commit
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

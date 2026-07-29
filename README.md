# PaySlip — On-chain ETH payroll on Robinhood Chain

## Project Description
PaySlip is a decentralized payroll management system that enables employers to pay their global workforce instantly using ETH on [Robinhood Chain](https://docs.robinhood.com/chain/), an Arbitrum Orbit L2 settling to Ethereum. By moving payroll on-chain, we eliminate banking delays, reduce cross-border fees, and provide immutable proof of payment for both employers and employees. The app handles employee onboarding, automated salary calculations, and bulk transaction processing.

## Network

| | Testnet (default) | Mainnet |
|---|---|---|
| Chain ID | `46630` | `4663` |
| RPC | `https://rpc.testnet.chain.robinhood.com` | `https://rpc.mainnet.chain.robinhood.com` |
| Explorer | https://explorer.testnet.chain.robinhood.com | https://robinhoodchain.blockscout.com |
| Gas token | ETH | ETH |

Switch networks with `NEXT_PUBLIC_CHAIN_ENV` (`testnet` or `mainnet`). Chain definitions live in [src/lib/chains.ts](src/lib/chains.ts); all chain I/O goes through [src/lib/chain.ts](src/lib/chain.ts).

## Setup Instructions (How to run locally)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- An EVM wallet browser extension (MetaMask, Rabby, …)
- Testnet ETH for gas from https://faucet.testnet.chain.robinhood.com

### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/parth1241/payslip.git
   cd payslip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your MongoDB and NextAuth values. The Robinhood Chain defaults need no keys.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser. The app will prompt your wallet to add and switch to Robinhood Chain Testnet on first connect.

## Notes on the payroll flow

- **Bulk disburse sends one transaction per employee.** The EVM has no equivalent of Stellar's multi-operation transaction for plain native transfers, so a payroll run prompts the wallet once per employee and each payment settles independently. A failure partway through does not roll back earlier payments — `bulkDisburse` returns a per-employee result array so the UI can report exactly which ones landed.
- **Memos ride along as transaction calldata.** They are permanently recorded with the transfer and readable from the explorer, and they add gas proportional to their length.
- **Payment history is read from the Blockscout indexer**, not the RPC — native ETH transfers emit no logs, so `eth_getLogs` cannot see them.

## Screenshots

All screenshots below are real captures of the running app (`npm run dev`, 2x DPI).

### Landing Page
![Landing Page](./screenshots/desktop/01-landing.png)

### Payroll Sent — Transaction Success
![Transaction Success](./screenshots/desktop/09-transaction-success.png)

### Pricing
![Pricing](./screenshots/desktop/02-pricing.png)

### Sign In
![Sign In](./screenshots/desktop/03-login.png)

### Mobile
![Mobile Landing](./screenshots/mobile/01-landing-mobile.png)

> Employer dashboard, payroll run, and employee portal screenshots are still to be
> captured — those routes require an authenticated session and a connected wallet.

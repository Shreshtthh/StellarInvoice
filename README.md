# StellarInvoice 

[![Scaffold Stellar]<img width="610" height="630" alt="Screenshot 2025-11-10 193921" src="https://github.com/user-attachments/assets/b9e3158b-fcb7-4b74-8f95-fb682a2c3390" />

> **Hackathon Submission**: Open Innovation using Scaffold Stellar

A decentralized invoice financing marketplace built on Stellar that transforms unpaid invoices into tradeable on-chain assets, connecting businesses seeking instant liquidity with investors seeking high-yield opportunities.

## 🎯 Problem Statement

Businesses, especially small and medium enterprises, face critical cash flow gaps while waiting 30-90 days for invoice payments. This creates operational challenges and limits growth potential.

## 💡 Solution

StellarInvoice creates a two-sided marketplace where:

- **Businesses (Issuers)** can tokenize their unpaid invoices and sell them at a discount for instant cash
- **Investors** can purchase these invoice-backed assets at a discount and earn predictable returns (APR) when invoices are paid

## ✨ Key Features

### For Businesses (Issuers)
- 📝 Create on-chain invoice assets with face value, due date, and terms
- 💰 Set target APR and get instant discount price calculations
- ⚡ Receive immediate liquidity without traditional financing hassles
- 📊 Track issued invoices and their status

### For Investors
- 🛒 Browse marketplace of invoice opportunities sorted by APR and maturity
- 💎 Purchase invoices at discounted prices
- 📈 Earn predictable, high-yield returns when invoices settle
- 📱 Manage portfolio of owned invoices with real-time tracking

## 🏆 Hackathon Requirements

This project successfully fulfills all three core requirements:

### ✅ 1. Deployed Smart Contract
- **Contract Name**: `InvoiceRegistry`
- **Network**: Stellar Futurenet
- **Contract ID**: `CAUW3SVRZVIO5KHK3JOGMQ57PSYZMPXGZHPEY5HBUFI4CGTANNJWITVO`
- **Language**: Rust (Soroban SDK)

### ✅ 2. Functional Front End
- **Framework**: React 19 + TypeScript + Vite
- **UI Library**: @stellar/design-system
- **Features**:
  - Issuer Dashboard for creating and listing invoices
  - Marketplace for browsing and purchasing invoices
  - Investor Portfolio for tracking owned assets
  - Integrated debugging interface

### ✅ 3. Stellar Wallet Kit Integration
- Full wallet connection/disconnection flow
- Transaction signing for all write operations
- Secure address management
- Built-in wallet provider context

## 🏗️ Architecture

### Smart Contract (`InvoiceRegistry`)

**Core Data Structures:**

```rust
pub struct Invoice {
    id: u64,
    issuer: Address,
    owner: Address,
    asset: Address,
    face_amount: i128,
    discount_amount: Option<i128>,
    due_timestamp: u64,
    status: InvoiceStatus,
    buyer: Option<Address>,
    created_at: u64,
    memo: String,
}

pub enum InvoiceStatus {
    Draft,
    ListedFixed,
    Sold,
    Settled,
    Defaulted,
    Canceled,
}
```

**Key Functions:**

| Function | Description | Authorization |
|----------|-------------|---------------|
| `create_invoice` | Creates new invoice in Draft status | Any user |
| `list_fixed` | Lists invoice at discount price | Invoice issuer |
| `buy_now` | Purchases listed invoice | Any user |
| `repay` | Settles invoice at face value | Any user (typically debtor) |
| `get_invoice` | Fetches invoice data | Public view |

**Storage Strategy:**
- **Instance Storage**: Platform configuration, invoice counter
- **Persistent Storage**: Individual invoice data with extended TTL

### Frontend Architecture

**Tech Stack:**
- React 19 with TypeScript
- Vite for build tooling
- React Router for navigation
- @tanstack/react-query for server state
- React Context for global state

**Key Pages:**
- `/` - Home and project overview
- `/marketplace` - Browse and purchase invoices
- `/issuer` - Create and list new invoices
- `/portfolio` - View owned invoice assets
- `/debug` - Contract interaction debugger

**State Management:**
- **Server State**: React Query hooks in `src/hooks/useInvoices.ts`
- **Global State**: Context providers for wallet and notifications
- **Business Logic**: ROI calculation utilities in `src/utils/roi-calculator.ts`

## 🚀 How Scaffold Stellar Powered This Build

This project showcases the power of Scaffold Stellar to accelerate dApp development:

### 1. **Automated Type-Safe Client Generation**
```bash
npm run dev  # Runs stellar scaffold watch --build-clients
```
- Automatically generated TypeScript client from Rust contract
- Full type safety for all function inputs/outputs
- Zero manual client code required

### 2. **Zero-Config Wallet Integration**
- Pre-built `WalletProvider` and `useWallet` hook
- Instant access to `address` and `signTransaction`
- No boilerplate wallet connection code

### 3. **Built-in Debugging Tools**
- `/debug` page for testing contract functions
- Interactive parameter input and response viewing
- Accelerated development and testing cycles

### 4. **Seamless Environment Management**
- `environments.toml` configuration
- Automatic contract deployment
- Generated client includes deployed contract ID

### 5. **Modern Frontend Scaffold**
- Pre-configured React + Vite + TypeScript
- @stellar/design-system components
- Professional UI out of the box

**Result**: 100% focus on business logic and user experience, not boilerplate.

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Rust toolchain
- Docker (for local development)
- Stellar CLI

### Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd stellarinvoice

# Install dependencies
npm install

# Install contract dependencies
cd contracts/invoice_registry
cargo build --target wasm32-unknown-unknown --release
cd ../..
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_CONTRACT_ID=CAUW3SVRZVIO5KHK3JOGMQ57PSYZMPXGZHPEY5HBUFI4CGTANNJWITVO
VITE_NETWORK=futurenet
```

## 🎮 Usage

### Development Mode

```bash
# Start development server with auto-reload and client generation
npm run dev
```

Visit `http://localhost:5173` to interact with the application.

### Build for Production

```bash
npm run build
```

### Contract Deployment

```bash
# Deploy to Futurenet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/invoice_registry.wasm \
  --network futurenet
```

## 📊 User Workflows

### Issuer Workflow

1. **Connect Wallet** → Click "Connect Wallet" and approve connection
2. **Create Invoice** → Navigate to Issuer Dashboard
   - Enter face value (e.g., $10,000)
   - Set days until due (e.g., 30 days)
   - Add memo/description
   - Set target APR (e.g., 35%)
3. **Sign Transactions**:
   - `create_invoice` - Creates the invoice NFT
   - `list_fixed` - Lists it at calculated discount price
4. **Receive Liquidity** → Instant payment when investor purchases

### Investor Workflow

1. **Connect Wallet** → Authenticate via Wallet Kit
2. **Browse Marketplace** → View available invoices
   - Sort by APR, maturity date, or face value
   - Review invoice details and terms
3. **Purchase Invoice** → Click "Buy Now"
   - Sign `buy_now` transaction
   - Invoice transfers to your ownership
4. **Track Returns** → Monitor portfolio
   - View expected payout and maturity date
   - Receive face value upon settlement

## 🧪 Testing

The included debugger page (`/debug`) allows direct contract interaction:

```typescript
// Example: Create an invoice
await createInvoice({
  face_amount: 10000000000n, // 10,000 units (7 decimals)
  asset: "NATIVE",
  due_timestamp: 1735689600n, // Unix timestamp
  memo: "Invoice #1234"
});
```

## 📁 Project Structure

```
stellarinvoice/
├── contracts/
│   └── invoice_registry/          # Rust smart contract
│       ├── src/
│       │   └── lib.rs            # Contract implementation
│       └── Cargo.toml
├── src/
│   ├── components/               # Reusable UI components
│   ├── contracts/                # Auto-generated TypeScript clients
│   │   └── invoice_registry.ts  # Generated client (do not edit)
│   ├── hooks/
│   │   └── useInvoices.ts       # React Query hooks for contract
│   ├── pages/                    # Page components
│   │   ├── Home.tsx
│   │   ├── Marketplace.tsx
│   │   ├── IssuerDashboard.tsx
│   │   └── InvestorPortfolio.tsx
│   ├── utils/
│   │   └── roi-calculator.ts    # Financial calculations
│   └── App.tsx                   # Main application component
├── environments.toml              # Deployment configuration
└── package.json
```

## 🔐 Security Considerations

**Current Implementation (Demo):**
- Token transfers are commented out for hackathon demonstration
- Status transitions are validated but not financially enforced

**Production Requirements:**
- Implement actual token transfers using Stellar assets
- Add escrow mechanism for face amount
- Implement reputation system for issuers
- Add invoice verification process
- Include dispute resolution mechanism

## 🛣️ Roadmap

- [ ] **Phase 1**: Implement real token transfers with USDC
- [ ] **Phase 2**: Add credit scoring for issuers
- [ ] **Phase 3**: Implement auction-based pricing alongside fixed pricing
- [ ] **Phase 4**: Build mobile-responsive UI
- [ ] **Phase 5**: Add analytics dashboard
- [ ] **Phase 6**: Integrate with accounting software APIs
- [ ] **Phase 7**: Launch on Mainnet

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


**Built for the Scaffold Stellar Open Innovation Hackathon** 🌟

*Transforming invoices into liquid assets, one block at a time.*

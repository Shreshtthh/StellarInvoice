use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum InvoiceStatus {
    Draft = 0,
    ListedFixed = 1,
    Sold = 2,
    Settled = 3,
    Defaulted = 4,
    Canceled = 5,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Invoice {
    pub id: u64,
    pub issuer: Address,
    pub asset: Address,
    pub face_amount: i128,
    pub discount_amount: Option<i128>,
    pub due_timestamp: u64,
    pub status: InvoiceStatus,
    pub owner: Address,
    pub buyer: Option<Address>,
    pub created_at: u64,
    pub memo: String,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct PlatformConfig {
    pub admin: Address,
    pub platform_fee_bps: u32,
}

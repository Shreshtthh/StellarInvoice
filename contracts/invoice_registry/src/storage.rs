use soroban_sdk::{contracttype, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Invoice(u64),
    NextInvoiceId,
    Config,
}

const INVOICE_LIFETIME: u32 = 5184000;
const CONFIG_LIFETIME: u32 = 5184000;

pub fn extend_invoice(env: &Env, id: u64) {
    env.storage()
        .persistent()
        .extend_ttl(&DataKey::Invoice(id), INVOICE_LIFETIME, INVOICE_LIFETIME);
}

pub fn extend_config(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INVOICE_LIFETIME, INVOICE_LIFETIME);
}

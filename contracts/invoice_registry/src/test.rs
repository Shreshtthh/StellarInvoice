#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, InvoiceRegistry);
    let client = InvoiceRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let platform_fee_bps = 20u32; // 0.2%

    client.initialize(&admin, &platform_fee_bps);

    let config = client.get_config();
    assert_eq!(config.admin, admin);
    assert_eq!(config.platform_fee_bps, 20);
}

#[test]
fn test_create_invoice() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, InvoiceRegistry);
    let client = InvoiceRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let asset = Address::generate(&env);

    client.initialize(&admin, &20u32);

    let invoice_id = client.create_invoice(
        &1000i128,
        &asset,
        &(env.ledger().timestamp() + 2592000), // 30 days
        &String::from_str(&env, "Test invoice"),
    );

    assert_eq!(invoice_id, 1);

    let invoice = client.get_invoice(&invoice_id);
    assert_eq!(invoice.face_amount, 1000);
}

#[test]
fn test_full_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, InvoiceRegistry);
    let client = InvoiceRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let investor = Address::generate(&env);
    let asset = Address::generate(&env);

    // Initialize
    client.initialize(&admin, &20u32);

    // Create invoice
    let invoice_id = client.create_invoice(
        &1000i128,
        &asset,
        &(env.ledger().timestamp() + 2592000),
        &String::from_str(&env, "Test"),
    );

    // List invoice
    client.list_fixed(&invoice_id, &975i128);

    let invoice = client.get_invoice(&invoice_id);
    assert_eq!(invoice.status, InvoiceStatus::ListedFixed);
    assert_eq!(invoice.discount_amount, Some(975));
}

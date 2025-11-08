#![no_std]

mod errors;
mod storage;
mod types;

use errors::Error;
use soroban_sdk::{contract, contractimpl, token, Address, Env, String};
use storage::{extend_config, extend_invoice, DataKey};
use types::{Invoice, InvoiceStatus, PlatformConfig};

#[contract]
pub struct InvoiceRegistry;

#[contractimpl]
impl InvoiceRegistry {
    /// Initialize the contract with admin and platform fee
    pub fn initialize(env: Env, admin: Address, platform_fee_bps: u32) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Config) {
            return Err(Error::AlreadyInitialized);
        }

        admin.require_auth();

        let config = PlatformConfig {
            admin: admin.clone(),
            platform_fee_bps,
        };

        env.storage().instance().set(&DataKey::Config, &config);
        env.storage().instance().set(&DataKey::NextInvoiceId, &1u64);

        extend_config(&env);

        env.events().publish(
            (String::from_str(&env, "initialized"),),
            (admin, platform_fee_bps),
        );

        Ok(())
    }

    /// Create a new invoice
    pub fn create_invoice(
        env: Env,
        issuer: Address,
        face_amount: i128,
        asset: Address,
        due_timestamp: u64,
        memo: String,
    ) -> Result<u64, Error> {
        issuer.require_auth();

        if face_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        if due_timestamp <= env.ledger().timestamp() {
            return Err(Error::InvalidDueDate);
        }

        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextInvoiceId)
            .unwrap_or(1);

        let invoice = Invoice {
            id,
            issuer: issuer.clone(),
            asset: asset.clone(),
            face_amount,
            discount_amount: None,
            due_timestamp,
            status: InvoiceStatus::Draft,
            owner: issuer.clone(),
            buyer: None,
            created_at: env.ledger().timestamp(),
            memo: memo.clone(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Invoice(id), &invoice);
        
        env.storage()
            .instance()
            .set(&DataKey::NextInvoiceId, &(id + 1));

        extend_invoice(&env, id);
        extend_config(&env);

        env.events().publish(
            (String::from_str(&env, "invoice_created"), id),
            (issuer, face_amount, asset, due_timestamp),
        );

        Ok(id)
    }

    /// List invoice at fixed discount price
    pub fn list_fixed(env: Env, invoice_id: u64, discount_amount: i128) -> Result<(), Error> {
        let mut invoice = Self::get_invoice_internal(&env, invoice_id)?;
        
        invoice.issuer.require_auth();

        if invoice.status != InvoiceStatus::Draft {
            return Err(Error::InvalidStatus);
        }

        if discount_amount <= 0 || discount_amount >= invoice.face_amount {
            return Err(Error::InvalidDiscount);
        }

        invoice.discount_amount = Some(discount_amount);
        invoice.status = InvoiceStatus::ListedFixed;

        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);

        extend_invoice(&env, invoice_id);

        env.events().publish(
            (String::from_str(&env, "invoice_listed"), invoice_id),
            discount_amount,
        );

        Ok(())
    }

    /// Buy invoice at listed price
    pub fn buy_now(env: Env, buyer: Address, invoice_id: u64) -> Result<(), Error> {
        buyer.require_auth();

        let mut invoice = Self::get_invoice_internal(&env, invoice_id)?;

        if invoice.status != InvoiceStatus::ListedFixed {
            return Err(Error::NotListed);
        }

        let proceeds = invoice.discount_amount.ok_or(Error::InvalidDiscount)?;

        let asset_client = token::Client::new(&env, &invoice.asset);
        asset_client.transfer(&buyer, &invoice.issuer, &proceeds);

        invoice.owner = buyer.clone();
        invoice.buyer = Some(buyer.clone());
        invoice.status = InvoiceStatus::Sold;

        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);

        extend_invoice(&env, invoice_id);

        env.events().publish(
            (String::from_str(&env, "invoice_sold"), invoice_id),
            (buyer, proceeds),
        );

        Ok(())
    }

    /// Repay invoice
    pub fn repay(env: Env, payer: Address, invoice_id: u64) -> Result<(), Error> {
        payer.require_auth();

        let mut invoice = Self::get_invoice_internal(&env, invoice_id)?;

        if invoice.status != InvoiceStatus::Sold {
            return Err(Error::CannotRepay);
        }

        let config = Self::get_config_internal(&env)?;
        
        let platform_fee = (invoice.face_amount * config.platform_fee_bps as i128) / 10000;
        let investor_payout = invoice.face_amount - platform_fee;

        let asset_client = token::Client::new(&env, &invoice.asset);

        asset_client.transfer(&payer, &invoice.owner, &investor_payout);

        if platform_fee > 0 {
            asset_client.transfer(&payer, &config.admin, &platform_fee);
        }

        invoice.status = InvoiceStatus::Settled;

        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);

        extend_invoice(&env, invoice_id);

        env.events().publish(
            (String::from_str(&env, "invoice_settled"), invoice_id),
            payer,
        );

        Ok(())
    }

    /// Cancel invoice
    pub fn cancel(env: Env, invoice_id: u64) -> Result<(), Error> {
        let mut invoice = Self::get_invoice_internal(&env, invoice_id)?;
        
        invoice.issuer.require_auth();

        if invoice.status != InvoiceStatus::Draft && invoice.status != InvoiceStatus::ListedFixed {
            return Err(Error::CannotCancel);
        }

        invoice.status = InvoiceStatus::Canceled;

        env.storage()
            .persistent()
            .set(&DataKey::Invoice(invoice_id), &invoice);

        extend_invoice(&env, invoice_id);

        env.events().publish(
            (String::from_str(&env, "invoice_canceled"), invoice_id),
            (),
        );

        Ok(())
    }

    /// Get invoice by ID
    pub fn get_invoice(env: Env, invoice_id: u64) -> Result<Invoice, Error> {
        Self::get_invoice_internal(&env, invoice_id)
    }

    /// Get platform config
    pub fn get_config(env: Env) -> Result<PlatformConfig, Error> {
        Self::get_config_internal(&env)
    }

    // Internal helpers
    fn get_invoice_internal(env: &Env, invoice_id: u64) -> Result<Invoice, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Invoice(invoice_id))
            .ok_or(Error::InvoiceNotFound)
    }

    fn get_config_internal(env: &Env) -> Result<PlatformConfig, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Config)
            .ok_or(Error::NotInitialized)
    }
}

mod test;

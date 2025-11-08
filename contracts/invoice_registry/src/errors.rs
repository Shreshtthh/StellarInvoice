use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    InvalidDueDate = 5,
    InvalidStatus = 6,
    InvalidDiscount = 7,
    InvoiceNotFound = 8,
    CannotCancel = 9,
    CannotRepay = 10,
    NotListed = 11,
}

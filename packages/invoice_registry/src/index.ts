import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  futurenet: {
    networkPassphrase: "Test SDF Future Network ; October 2022",
    contractId: "CAUW3SVRZVIO5KHK3JOGMQ57PSYZMPXGZHPEY5HBUFI4CGTANNJWITVO",
  }
} as const

export const Errors = {
  1: {message:"NotInitialized"},
  2: {message:"AlreadyInitialized"},
  3: {message:"Unauthorized"},
  4: {message:"InvalidAmount"},
  5: {message:"InvalidDueDate"},
  6: {message:"InvalidStatus"},
  7: {message:"InvalidDiscount"},
  8: {message:"InvoiceNotFound"},
  9: {message:"CannotCancel"},
  10: {message:"CannotRepay"},
  11: {message:"NotListed"}
}

export type DataKey = {tag: "Invoice", values: readonly [u64]} | {tag: "NextInvoiceId", values: void} | {tag: "Config", values: void};

export enum InvoiceStatus {
  Draft = 0,
  ListedFixed = 1,
  Sold = 2,
  Settled = 3,
  Defaulted = 4,
  Canceled = 5,
}


export interface Invoice {
  asset: string;
  buyer: Option<string>;
  created_at: u64;
  discount_amount: Option<i128>;
  due_timestamp: u64;
  face_amount: i128;
  id: u64;
  issuer: string;
  memo: string;
  owner: string;
  status: InvoiceStatus;
}


export interface PlatformConfig {
  admin: string;
  platform_fee_bps: u32;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract with admin and platform fee
   */
  initialize: ({admin, platform_fee_bps}: {admin: string, platform_fee_bps: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_invoice transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new invoice
   */
  create_invoice: ({issuer, face_amount, asset, due_timestamp, memo}: {issuer: string, face_amount: i128, asset: string, due_timestamp: u64, memo: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a list_fixed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * List invoice at fixed discount price
   */
  list_fixed: ({invoice_id, discount_amount}: {invoice_id: u64, discount_amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a buy_now transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buy invoice at listed price (DEMO MODE: Token transfer disabled)
   */
  buy_now: ({buyer, invoice_id}: {buyer: string, invoice_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a repay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Repay invoice (DEMO MODE: Token transfer disabled)
   */
  repay: ({payer, invoice_id}: {payer: string, invoice_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a cancel transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel invoice
   */
  cancel: ({invoice_id}: {invoice_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_invoice transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get invoice by ID
   */
  get_invoice: ({invoice_id}: {invoice_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Invoice>>>

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get platform config
   */
  get_config: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<PlatformConfig>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAMVW5hdXRob3JpemVkAAAAAwAAAAAAAAANSW52YWxpZEFtb3VudAAAAAAAAAQAAAAAAAAADkludmFsaWREdWVEYXRlAAAAAAAFAAAAAAAAAA1JbnZhbGlkU3RhdHVzAAAAAAAABgAAAAAAAAAPSW52YWxpZERpc2NvdW50AAAAAAcAAAAAAAAAD0ludm9pY2VOb3RGb3VuZAAAAAAIAAAAAAAAAAxDYW5ub3RDYW5jZWwAAAAJAAAAAAAAAAtDYW5ub3RSZXBheQAAAAAKAAAAAAAAAAlOb3RMaXN0ZWQAAAAAAAAL",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAAB0ludm9pY2UAAAAAAQAAAAYAAAAAAAAAAAAAAA1OZXh0SW52b2ljZUlkAAAAAAAAAAAAAAAAAAAGQ29uZmlnAAA=",
        "AAAAAwAAAAAAAAAAAAAADUludm9pY2VTdGF0dXMAAAAAAAAGAAAAAAAAAAVEcmFmdAAAAAAAAAAAAAAAAAAAC0xpc3RlZEZpeGVkAAAAAAEAAAAAAAAABFNvbGQAAAACAAAAAAAAAAdTZXR0bGVkAAAAAAMAAAAAAAAACURlZmF1bHRlZAAAAAAAAAQAAAAAAAAACENhbmNlbGVkAAAABQ==",
        "AAAAAQAAAAAAAAAAAAAAB0ludm9pY2UAAAAACwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAVidXllcgAAAAAAA+gAAAATAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAA9kaXNjb3VudF9hbW91bnQAAAAD6AAAAAsAAAAAAAAADWR1ZV90aW1lc3RhbXAAAAAAAAAGAAAAAAAAAAtmYWNlX2Ftb3VudAAAAAALAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAGaXNzdWVyAAAAAAATAAAAAAAAAARtZW1vAAAAEAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAANSW52b2ljZVN0YXR1cwAAAA==",
        "AAAAAQAAAAAAAAAAAAAADlBsYXRmb3JtQ29uZmlnAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAEHBsYXRmb3JtX2ZlZV9icHMAAAAE",
        "AAAAAAAAADNJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFkbWluIGFuZCBwbGF0Zm9ybSBmZWUAAAAACmluaXRpYWxpemUAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAQcGxhdGZvcm1fZmVlX2JwcwAAAAQAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAABRDcmVhdGUgYSBuZXcgaW52b2ljZQAAAA5jcmVhdGVfaW52b2ljZQAAAAAABQAAAAAAAAAGaXNzdWVyAAAAAAATAAAAAAAAAAtmYWNlX2Ftb3VudAAAAAALAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAADWR1ZV90aW1lc3RhbXAAAAAAAAAGAAAAAAAAAARtZW1vAAAAEAAAAAEAAAPpAAAABgAAAAM=",
        "AAAAAAAAACRMaXN0IGludm9pY2UgYXQgZml4ZWQgZGlzY291bnQgcHJpY2UAAAAKbGlzdF9maXhlZAAAAAAAAgAAAAAAAAAKaW52b2ljZV9pZAAAAAAABgAAAAAAAAAPZGlzY291bnRfYW1vdW50AAAAAAsAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAEBCdXkgaW52b2ljZSBhdCBsaXN0ZWQgcHJpY2UgKERFTU8gTU9ERTogVG9rZW4gdHJhbnNmZXIgZGlzYWJsZWQpAAAAB2J1eV9ub3cAAAAAAgAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAppbnZvaWNlX2lkAAAAAAAGAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAADJSZXBheSBpbnZvaWNlIChERU1PIE1PREU6IFRva2VuIHRyYW5zZmVyIGRpc2FibGVkKQAAAAAABXJlcGF5AAAAAAAAAgAAAAAAAAAFcGF5ZXIAAAAAAAATAAAAAAAAAAppbnZvaWNlX2lkAAAAAAAGAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAA5DYW5jZWwgaW52b2ljZQAAAAAABmNhbmNlbAAAAAAAAQAAAAAAAAAKaW52b2ljZV9pZAAAAAAABgAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAABFHZXQgaW52b2ljZSBieSBJRAAAAAAAAAtnZXRfaW52b2ljZQAAAAABAAAAAAAAAAppbnZvaWNlX2lkAAAAAAAGAAAAAQAAA+kAAAfQAAAAB0ludm9pY2UAAAAAAw==",
        "AAAAAAAAABNHZXQgcGxhdGZvcm0gY29uZmlnAAAAAApnZXRfY29uZmlnAAAAAAAAAAAAAQAAA+kAAAfQAAAADlBsYXRmb3JtQ29uZmlnAAAAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        create_invoice: this.txFromJSON<Result<u64>>,
        list_fixed: this.txFromJSON<Result<void>>,
        buy_now: this.txFromJSON<Result<void>>,
        repay: this.txFromJSON<Result<void>>,
        cancel: this.txFromJSON<Result<void>>,
        get_invoice: this.txFromJSON<Result<Invoice>>,
        get_config: this.txFromJSON<Result<PlatformConfig>>
  }
}
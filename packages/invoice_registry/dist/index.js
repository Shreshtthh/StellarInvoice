import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    futurenet: {
        networkPassphrase: "Test SDF Future Network ; October 2022",
        contractId: "CAUW3SVRZVIO5KHK3JOGMQ57PSYZMPXGZHPEY5HBUFI4CGTANNJWITVO",
    }
};
export const Errors = {
    1: { message: "NotInitialized" },
    2: { message: "AlreadyInitialized" },
    3: { message: "Unauthorized" },
    4: { message: "InvalidAmount" },
    5: { message: "InvalidDueDate" },
    6: { message: "InvalidStatus" },
    7: { message: "InvalidDiscount" },
    8: { message: "InvoiceNotFound" },
    9: { message: "CannotCancel" },
    10: { message: "CannotRepay" },
    11: { message: "NotListed" }
};
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus[InvoiceStatus["Draft"] = 0] = "Draft";
    InvoiceStatus[InvoiceStatus["ListedFixed"] = 1] = "ListedFixed";
    InvoiceStatus[InvoiceStatus["Sold"] = 2] = "Sold";
    InvoiceStatus[InvoiceStatus["Settled"] = 3] = "Settled";
    InvoiceStatus[InvoiceStatus["Defaulted"] = 4] = "Defaulted";
    InvoiceStatus[InvoiceStatus["Canceled"] = 5] = "Canceled";
})(InvoiceStatus || (InvoiceStatus = {}));
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAMVW5hdXRob3JpemVkAAAAAwAAAAAAAAANSW52YWxpZEFtb3VudAAAAAAAAAQAAAAAAAAADkludmFsaWREdWVEYXRlAAAAAAAFAAAAAAAAAA1JbnZhbGlkU3RhdHVzAAAAAAAABgAAAAAAAAAPSW52YWxpZERpc2NvdW50AAAAAAcAAAAAAAAAD0ludm9pY2VOb3RGb3VuZAAAAAAIAAAAAAAAAAxDYW5ub3RDYW5jZWwAAAAJAAAAAAAAAAtDYW5ub3RSZXBheQAAAAAKAAAAAAAAAAlOb3RMaXN0ZWQAAAAAAAAL",
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
            "AAAAAAAAABNHZXQgcGxhdGZvcm0gY29uZmlnAAAAAApnZXRfY29uZmlnAAAAAAAAAAAAAQAAA+kAAAfQAAAADlBsYXRmb3JtQ29uZmlnAAAAAAAD"]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        create_invoice: (this.txFromJSON),
        list_fixed: (this.txFromJSON),
        buy_now: (this.txFromJSON),
        repay: (this.txFromJSON),
        cancel: (this.txFromJSON),
        get_invoice: (this.txFromJSON),
        get_config: (this.txFromJSON)
    };
}

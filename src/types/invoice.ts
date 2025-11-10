export interface InvoiceData {
  id: bigint;
  issuer: string;
  asset: string;
  face_amount: bigint;
  discount_amount?: bigint;
  due_timestamp: bigint;
  status: InvoiceStatus;
  owner: string;
  buyer?: string;
  created_at: bigint;
  memo: string;
}

export enum InvoiceStatus {
  Draft = 0,
  ListedFixed = 1,
  Sold = 2,
  Settled = 3,
  Defaulted = 4,
  Canceled = 5,
}

export const statusLabels: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Draft]: "Draft",
  [InvoiceStatus.ListedFixed]: "Listed",
  [InvoiceStatus.Sold]: "Sold",
  [InvoiceStatus.Settled]: "Settled",
  [InvoiceStatus.Defaulted]: "Defaulted",
  [InvoiceStatus.Canceled]: "Canceled",
};

export function calculateAPR(
  faceAmount: number,
  discountAmount: number,
  daysUntilDue: number
): number {
  if (daysUntilDue === 0) return 0;
  const discount = faceAmount - discountAmount;
  const discountPercent = (discount / discountAmount) * 100;
  const apr = (discountPercent * 365) / daysUntilDue;
  return apr;
}

export function calculateDiscountAmount(
  faceAmount: number,
  targetAPR: number,
  daysUntilDue: number
): number {
  const dailyRate = targetAPR / 365 / 100;
  const discountPercent = dailyRate * daysUntilDue;
  return faceAmount * (1 - discountPercent / (1 + discountPercent));
}

export function calculateDaysUntilDue(dueTimestamp: bigint): number {
  const now = Math.floor(Date.now() / 1000);
  const due = Number(dueTimestamp);
  return Math.max(0, Math.ceil((due - now) / 86400));
}

export function formatCurrency(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  // Assuming 7 decimals for Stellar tokens
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num / 10000000);
}

export function stroopsToNumber(stroops: bigint): number {
  return Number(stroops) / 10000000;
}

export function numberToStroops(num: number): bigint {
  return BigInt(Math.floor(num * 10000000));
}

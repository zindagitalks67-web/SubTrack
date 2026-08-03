export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to USD
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, label: 'British Pound (£)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, label: 'Indian Rupee (₹)' },
};

/**
 * Converts amount from USD base to target currency and formats it.
 */
export function formatCurrency(
  amountInUSD: number,
  currencyCode: CurrencyCode = 'USD'
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const convertedAmount = amountInUSD * config.rate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.code === 'INR' ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
}
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // Base rate relative to USD
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', rate: 0.79 },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'CAD ($)', rate: 1.35 },
  AUD: { code: 'AUD', symbol: 'A$', label: 'AUD ($)', rate: 1.52 },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', rate: 83.2 },
};

// Local storage key for cached rates
const RATES_CACHE_KEY = 'subtrack_live_currency_rates';

/**
 * Fetch live exchange rates relative to USD (Free API)
 */
export async function fetchLiveExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data && data.rates) {
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(data.rates));
      return data.rates;
    }
  } catch (err) {
    console.warn('Failed to fetch live rates, using fallback/cached rates', err);
  }

  // Return cached rates if available
  const cached = localStorage.getItem(RATES_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Convert USD cost to selected target currency using live or fallback rates
 */
export function convertCurrency(
  amountInUSD: number,
  targetCurrency: CurrencyCode = 'USD',
  liveRates?: Record<string, number> | null
): number {
  if (targetCurrency === 'USD') return amountInUSD;

  let rate = CURRENCIES[targetCurrency]?.rate || 1;

  if (liveRates && liveRates[targetCurrency]) {
    rate = liveRates[targetCurrency];
  }

  return amountInUSD * rate;
}

/**
 * Format currency symbol + amount
 */
export function formatCurrency(
  amountInUSD: number,
  targetCurrency: CurrencyCode = 'USD',
  liveRates?: Record<string, number> | null
): string {
  const converted = convertCurrency(amountInUSD, targetCurrency, liveRates);
  const symbol = CURRENCIES[targetCurrency]?.symbol || '$';

  return `${symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
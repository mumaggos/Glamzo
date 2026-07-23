import { useDevOverride } from '../contexts/DevOverrideContext';

export function useCurrency() {
  const { overrideCurrency } = useDevOverride();
  
  // Fake auto-detection logic (fallback to EUR if no IP detection is actually present)
  // In a real app we might fetch user country, but here we just use the override or default to EUR.
  const currencyCode = overrideCurrency || 'EUR';
  const symbol = currencyCode === 'USD' ? '$' : '€';

  const formatPrice = (amountInEur: number) => {
    // Fake exchange rate for demonstration: 1 EUR = 1.10 USD
    let converted = amountInEur;
    if (currencyCode === 'USD') {
      converted = amountInEur * 1.10;
    }
    
    // Format according to currency
    if (currencyCode === 'USD') {
      return `$${converted.toFixed(2)}`;
    }
    return `${converted.toFixed(2).replace('.', ',')}€`;
  };

  return { currencyCode, symbol, formatPrice };
}

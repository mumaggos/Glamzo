export const formatCurrency = (amount: number, currency: string = 'EUR') => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  } catch (e) {
    // Fallback if currency code is invalid
    return amount.toFixed(2) + ' ' + (currency || 'EUR');
  }
};

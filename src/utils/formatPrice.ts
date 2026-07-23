import { useGlobalStore } from '../store/useGlobalStore';

export const useFormatPrice = () => {
  const defaultCurrency = useGlobalStore((state) => state.currency);

  return (amount: number, specificCurrency?: string): string => {
    const currency = specificCurrency || defaultCurrency;
    return new Intl.NumberFormat(currency === 'EUR' ? 'pt-PT' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
};

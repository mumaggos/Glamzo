import { useGlobalStore } from '../store/useGlobalStore';

export const useFormatPrice = () => {
  const currency = useGlobalStore((state) => state.currency);

  return (amount: number): string => {
    return new Intl.NumberFormat(currency === 'EUR' ? 'pt-PT' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
};

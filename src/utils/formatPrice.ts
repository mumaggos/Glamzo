import { useGlobalStore } from '../store/useGlobalStore';
import { useTranslation } from "react-i18next";

export const useFormatPrice = () => {
    const { t } = useTranslation();
  const defaultCurrency = useGlobalStore((state) => state.currency);

  return (amount: number, specificCurrency?: string): string => {
    const currency = specificCurrency || defaultCurrency;
    return new Intl.NumberFormat(currency === 'EUR' ? 'pt-PT' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
};

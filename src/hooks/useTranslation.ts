import { useDevOverride } from '../contexts/DevOverrideContext';

// Simple dictionary for demonstration
const DICTIONARY: Record<string, Record<string, string>> = {
  'pt-PT': {
    'setup.pro.title': 'Glamzo PRO',
    'setup.pro.desc': 'O ecossistema essencial para lotar a sua agenda e gerir o seu espaço.',
    'setup.terminal.title': 'Terminal Físico Glamzo',
    'setup.terminal.desc': 'Esqueça os alugueres mensais. Compre a sua máquina e ela é sua para sempre.',
    'setup.terminal.price': 'Único',
    'setup.free_trial': '14 Dias Grátis',
    'setup.recommended': 'Recomendado',
    'setup.shipping_included': 'Portes e Impostos Incluídos',
    'hardware.terminal.title': 'Terminal Físico (Stripe Reader)',
    'hardware.terminal.desc': 'Leitor de cartões físico dedicado, ideal para o balcão. Liga-se por Bluetooth à sua App.',
    'hardware.terminal.price': 'Starter Kit: {price} (Hardware + Envio Express)',
    'hardware.order_button': 'Encomendar Terminal',
    'partner.pro.title': 'Glamzo PRO',
    'partner.terminal.title': 'Terminal Físico Glamzo',
  },
  'en-US': {
    'setup.pro.title': 'Glamzo PRO',
    'setup.pro.desc': 'The essential ecosystem to fill your schedule and manage your space.',
    'setup.terminal.title': 'Glamzo Physical Terminal',
    'setup.terminal.desc': 'Forget monthly rentals. Buy your machine and it is yours forever.',
    'setup.terminal.price': 'One-time',
    'setup.free_trial': '14 Days Free',
    'setup.recommended': 'Recommended',
    'setup.shipping_included': 'Shipping and Taxes Included',
    'hardware.terminal.title': 'Physical Terminal (Stripe Reader)',
    'hardware.terminal.desc': 'Dedicated physical card reader, ideal for the counter. Connects via Bluetooth to your App.',
    'hardware.terminal.price': 'Starter Kit: {price} (Hardware + Express Shipping)',
    'hardware.order_button': 'Order Terminal',
    'partner.pro.title': 'Glamzo PRO',
    'partner.terminal.title': 'Glamzo Physical Terminal',
  }
};

export function useTranslation() {
  const { overrideLanguage } = useDevOverride();
  const lang = overrideLanguage || 'pt-PT';

  const t = (key: string, params?: Record<string, string>) => {
    let text = DICTIONARY[lang]?.[key] || DICTIONARY['pt-PT']?.[key] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(`{${k}}`, params[k]);
      });
    }
    return text;
  };

  return { t, lang };
}

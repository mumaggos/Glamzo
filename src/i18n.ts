import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useGlobalStore } from './store/useGlobalStore';

const resources = {
  en: {
    translation: {
      "home": "Home",
      "explore": "Explore",
      "appointments": "Appointments",
      "account": "Account",
      "search_placeholder": "Search services, businesses...",
      "map_view": "Map",
      "list_view": "List",
      "book_now": "Book Now",
      "near_you": "Near You",
      "developer_panel": "Developer Panel",
      "language": "Language",
      "currency": "Currency",
      "close": "Close",
      "price": "Price",
      "distance": "Distance",
      "open_now": "Open Now",
      "closed": "Closed"
    }
  },
  pt: {
    translation: {
      "home": "Início",
      "explore": "Explorar",
      "appointments": "Marcações",
      "account": "Conta",
      "search_placeholder": "Pesquisar serviços, negócios...",
      "map_view": "Mapa",
      "list_view": "Lista",
      "book_now": "Marcar",
      "near_you": "Perto de Si",
      "developer_panel": "Painel de Testes",
      "language": "Idioma",
      "currency": "Moeda",
      "close": "Fechar",
      "price": "Preço",
      "distance": "Distância",
      "open_now": "Aberto",
      "closed": "Fechado"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

// Subscribe to store changes to update i18n language
useGlobalStore.subscribe((state) => {
  if (i18n.language !== state.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;

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
      "closed": "Closed",
      "hero_title_1": "Your beauty moment,",
      "hero_title_2": "booked in an instant.",
      "hero_desc": "Discover and book online the best beauty salons, barbershops, and spas around you. Fast, secure, and hassle-free.",
      "hero_search_what": "Treatment or Salon",
      "hero_search_what_ph": "Ex: Haircut, Manicure...",
      "hero_search_where": "Location",
      "hero_search_where_ph": "Where are you?",
      "hero_search_btn": "Search",
      "guarantee_1": "Instant Confirmation",
      "guarantee_2": "24/7 Availability",
      "guarantee_3": "Secure Payment"
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
      "closed": "Fechado",
      "hero_title_1": "O seu momento de beleza,",
      "hero_title_2": "marcado num instante.",
      "hero_desc": "Descubra e reserve online os melhores salões de beleza, barbearias e spas ao seu redor. Rápido, seguro e sem complicações.",
      "hero_search_what": "Tratamento ou Salão",
      "hero_search_what_ph": "Ex: Corte, Manicure...",
      "hero_search_where": "Localização",
      "hero_search_where_ph": "Onde se encontra?",
      "hero_search_btn": "Pesquisar",
      "guarantee_1": "Confirmação Imediata",
      "guarantee_2": "Disponibilidade 24/7",
      "guarantee_3": "Pagamento Seguro"
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

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
      "guarantee_3": "Secure Payment",
      "services": "Services",
      "service_menu": "Service Menu",
      "no_services": "No services available at the moment.",
      "book": "Book",
      "step_service": "Service",
      "step_staff": "Professional",
      "step_datetime": "Date & Time",
      "step_payment": "Payment",
      "step_confirm": "Confirm",
      "any_professional": "Any Professional",
      "no_available_times": "No available times",
      "pay_local": "Pay at Venue",
      "pay_local_desc": "Cash or card at the counter.",
      "pay_online": "Secure Online Payment",
      "pay_online_desc": "Card, Apple Pay or Google Pay.",
      "total_to_pay": "Total to Pay",
      "promo_code": "Promo Code",
      "apply": "Apply",
      "remove": "Remove",
      "notes_salon": "Notes for the salon",
      "confirm_booking": "Confirm Booking",
      "booking_success": "Booking confirmed successfully!"
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
      "guarantee_3": "Pagamento Seguro",
      "services": "Serviços",
      "service_menu": "Menu de Serviços",
      "no_services": "Nenhum serviço disponível de momento.",
      "book": "Reservar",
      "step_service": "Serviço",
      "step_staff": "Profissional",
      "step_datetime": "Data & Hora",
      "step_payment": "Pagamento",
      "step_confirm": "Confirmar",
      "any_professional": "Qualquer Profissional",
      "no_available_times": "Sem horários disponíveis",
      "pay_local": "Pagar no Local",
      "pay_local_desc": "Dinheiro ou MBWay no balcão.",
      "pay_online": "Pagamento Online Seguro",
      "pay_online_desc": "Cartão, MBWay ou Apple Pay.",
      "total_to_pay": "Total a Pagar",
      "promo_code": "Código Promocional",
      "apply": "Aplicar",
      "remove": "Remover",
      "notes_salon": "Observações para o salão",
      "confirm_booking": "Confirmar Marcação",
      "booking_success": "Marcação confirmada com sucesso!"
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

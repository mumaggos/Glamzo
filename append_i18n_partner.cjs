const fs = require('fs');
let i18nCode = fs.readFileSync('src/i18n.ts', 'utf8');

const newKeys = {
  en: {
    "ptnr_overview": "Overview",
    "ptnr_agenda": "Agenda",
    "ptnr_reservations": "Reservations",
    "ptnr_clients": "Clients",
    "ptnr_team": "Team",
    "ptnr_services": "Services",
    "ptnr_hours": "Hours",
    "ptnr_reviews": "Reviews",
    "ptnr_promotions": "Promotions",
    "ptnr_billing": "Billing",
    "ptnr_payment_config": "Payment Configuration",
    "ptnr_payouts_history": "Payouts History",
    "ptnr_hardware": "Terminals & Hardware",
    "ptnr_subscription": "Subscription",
    "ptnr_website": "Website & QR Code",
    "ptnr_messages": "Messages",
    "ptnr_tablet": "Glamzo Terminal",
    "ptnr_settings": "Settings"
  },
  pt: {
    "ptnr_overview": "Resumo",
    "ptnr_agenda": "Agenda",
    "ptnr_reservations": "Reservas",
    "ptnr_clients": "Clientes",
    "ptnr_team": "Equipa",
    "ptnr_services": "Serviços",
    "ptnr_hours": "Horários",
    "ptnr_reviews": "Avaliações",
    "ptnr_promotions": "Promoções",
    "ptnr_billing": "Faturação",
    "ptnr_payment_config": "Configuração Pagamentos",
    "ptnr_payouts_history": "Histórico Repasses",
    "ptnr_hardware": "Terminais & Hardware",
    "ptnr_subscription": "Subscrição",
    "ptnr_website": "Website & QR Code",
    "ptnr_messages": "Mensagens",
    "ptnr_tablet": "Terminal Glamzo",
    "ptnr_settings": "Configurações"
  },
  es: {
    "ptnr_overview": "Resumen",
    "ptnr_agenda": "Agenda",
    "ptnr_reservations": "Reservas",
    "ptnr_clients": "Clientes",
    "ptnr_team": "Equipo",
    "ptnr_services": "Servicios",
    "ptnr_hours": "Horarios",
    "ptnr_reviews": "Reseñas",
    "ptnr_promotions": "Promociones",
    "ptnr_billing": "Facturación",
    "ptnr_payment_config": "Configuración Pagos",
    "ptnr_payouts_history": "Historial Pagos",
    "ptnr_hardware": "Terminales & Hardware",
    "ptnr_subscription": "Suscripción",
    "ptnr_website": "Website & QR Code",
    "ptnr_messages": "Mensajes",
    "ptnr_tablet": "Terminal Glamzo",
    "ptnr_settings": "Configuraciones"
  },
  fr: {
    "ptnr_overview": "Aperçu",
    "ptnr_agenda": "Agenda",
    "ptnr_reservations": "Réservations",
    "ptnr_clients": "Clients",
    "ptnr_team": "Équipe",
    "ptnr_services": "Services",
    "ptnr_hours": "Horaires",
    "ptnr_reviews": "Avis",
    "ptnr_promotions": "Promotions",
    "ptnr_billing": "Facturation",
    "ptnr_payment_config": "Configuration Paiements",
    "ptnr_payouts_history": "Historique des virements",
    "ptnr_hardware": "Terminaux & Matériel",
    "ptnr_subscription": "Abonnement",
    "ptnr_website": "Site web & QR Code",
    "ptnr_messages": "Messages",
    "ptnr_tablet": "Terminal Glamzo",
    "ptnr_settings": "Paramètres"
  },
  de: {
    "ptnr_overview": "Übersicht",
    "ptnr_agenda": "Agenda",
    "ptnr_reservations": "Reservierungen",
    "ptnr_clients": "Kunden",
    "ptnr_team": "Team",
    "ptnr_services": "Dienstleistungen",
    "ptnr_hours": "Zeiten",
    "ptnr_reviews": "Bewertungen",
    "ptnr_promotions": "Aktionen",
    "ptnr_billing": "Abrechnung",
    "ptnr_payment_config": "Zahlungskonfiguration",
    "ptnr_payouts_history": "Auszahlungsverlauf",
    "ptnr_hardware": "Terminals & Hardware",
    "ptnr_subscription": "Abonnement",
    "ptnr_website": "Webseite & QR Code",
    "ptnr_messages": "Nachrichten",
    "ptnr_tablet": "Glamzo Terminal",
    "ptnr_settings": "Einstellungen"
  }
};

for (const [lang, keys] of Object.entries(newKeys)) {
  let langBlockRegex = new RegExp(lang + ": \\{ translation: \\{([\\\\s\\\\S]*?)\\} \\}", 'm');
  const match = i18nCode.match(langBlockRegex);
  if (match) {
    let block = match[1];
    for (const [k, v] of Object.entries(keys)) {
      if (!block.includes('"' + k + '"')) {
        block += ',\\n      "' + k + '": "' + v + '"';
      }
    }
    i18nCode = i18nCode.replace(langBlockRegex, lang + ': { translation: {' + block + '} }');
  }
}

fs.writeFileSync('src/i18n.ts', i18nCode);

// Patch PartnerLayout
let partnerCode = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');

partnerCode = partnerCode.replace(/label: "Resumo"/g, "label: t('ptnr_overview') || 'Resumo'");
partnerCode = partnerCode.replace(/label: "Agenda"/g, "label: t('ptnr_agenda') || 'Agenda'");
partnerCode = partnerCode.replace(/label: "Reservas"/g, "label: t('ptnr_reservations') || 'Reservas'");
partnerCode = partnerCode.replace(/label: "Clientes"/g, "label: t('ptnr_clients') || 'Clientes'");
partnerCode = partnerCode.replace(/label: "Equipa"/g, "label: t('ptnr_team') || 'Equipa'");
partnerCode = partnerCode.replace(/label: "Serviços"/g, "label: t('ptnr_services') || 'Serviços'");
partnerCode = partnerCode.replace(/label: "Horários"/g, "label: t('ptnr_hours') || 'Horários'");
partnerCode = partnerCode.replace(/label: "Avaliações"/g, "label: t('ptnr_reviews') || 'Avaliações'");
partnerCode = partnerCode.replace(/label: "Promoções"/g, "label: t('ptnr_promotions') || 'Promoções'");
partnerCode = partnerCode.replace(/label: "Faturação"/g, "label: t('ptnr_billing') || 'Faturação'");
partnerCode = partnerCode.replace(/label: "Configuração Pagamentos"/g, "label: t('ptnr_payment_config') || 'Configuração Pagamentos'");
partnerCode = partnerCode.replace(/label: "Histórico Repasses"/g, "label: t('ptnr_payouts_history') || 'Histórico Repasses'");
partnerCode = partnerCode.replace(/label: "Terminais & Hardware"/g, "label: t('ptnr_hardware') || 'Terminais & Hardware'");
partnerCode = partnerCode.replace(/label: "Subscrição"/g, "label: t('ptnr_subscription') || 'Subscrição'");
partnerCode = partnerCode.replace(/label: "Website & QR Code"/g, "label: t('ptnr_website') || 'Website & QR Code'");
partnerCode = partnerCode.replace(/label: "Mensagens"/g, "label: t('ptnr_messages') || 'Mensagens'");
partnerCode = partnerCode.replace(/label: "Terminal Glamzo"/g, "label: t('ptnr_tablet') || 'Terminal Glamzo'");
partnerCode = partnerCode.replace(/label: "Configurações"/g, "label: t('ptnr_settings') || 'Configurações'");

fs.writeFileSync('src/components/partner/PartnerLayout.tsx', partnerCode);

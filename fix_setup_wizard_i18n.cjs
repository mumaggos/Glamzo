const fs = require('fs');
let i18nCode = fs.readFileSync('src/i18n.ts', 'utf8');

const newKeys = {
  en: {
    "setup_step_store": "Store",
    "setup_step_hours": "Hours",
    "setup_step_services": "Services",
    "setup_step_plan": "Plan",
    "setup_step_payments": "Payments",
    "setup_step_review": "Review",
    "setup_welcome": "Welcome to Glamzo PRO",
    "setup_welcome_desc": "Let's set up your store in 6 easy steps.",
    "setup_back": "Back",
    "setup_continue": "Continue",
    "setup_finish": "Complete Setup",
    "setup_images": "Store Images (Cover and Profile)",
    "setup_upload_logo": "Upload Logo",
    "setup_upload_cover": "Upload Cover",
    "setup_store_name": "Store Name *",
    "setup_store_category": "Store Category *",
    "setup_phone": "Phone *",
    "setup_email": "Email",
    "setup_address": "Address *",
    "setup_door": "Door / Floor",
    "setup_postal_code": "Postal Code *",
    "setup_city": "City *",
    "setup_district": "District *",
    "setup_exact_location": "Exact Location on Map *"
  },
  pt: {
    "setup_step_store": "Loja",
    "setup_step_hours": "Horários",
    "setup_step_services": "Serviços",
    "setup_step_plan": "Plano",
    "setup_step_payments": "Pagamentos",
    "setup_step_review": "Revisão",
    "setup_welcome": "Bem-vindo ao Glamzo PRO",
    "setup_welcome_desc": "Vamos configurar o teu estabelecimento em 6 passos simples.",
    "setup_back": "Voltar",
    "setup_continue": "Continuar",
    "setup_finish": "Concluir Configuração",
    "setup_images": "Imagens do Estabelecimento (Capa e Perfil)",
    "setup_upload_logo": "Carregar Logótipo",
    "setup_upload_cover": "Carregar Capa",
    "setup_store_name": "Nome do Estabelecimento *",
    "setup_store_category": "Categoria do Estabelecimento *",
    "setup_phone": "Telefone *",
    "setup_email": "E-mail",
    "setup_address": "Morada *",
    "setup_door": "Nº Porta / Andar",
    "setup_postal_code": "Código Postal *",
    "setup_city": "Cidade *",
    "setup_district": "Distrito *",
    "setup_exact_location": "Localização Exata no Mapa *"
  },
  es: {
    "setup_step_store": "Tienda",
    "setup_step_hours": "Horarios",
    "setup_step_services": "Servicios",
    "setup_step_plan": "Plan",
    "setup_step_payments": "Pagos",
    "setup_step_review": "Revisión",
    "setup_welcome": "Bienvenido a Glamzo PRO",
    "setup_welcome_desc": "Vamos a configurar tu establecimiento en 6 pasos sencillos.",
    "setup_back": "Atrás",
    "setup_continue": "Continuar",
    "setup_finish": "Completar Configuración",
    "setup_images": "Imágenes de la Tienda (Portada y Perfil)",
    "setup_upload_logo": "Subir Logotipo",
    "setup_upload_cover": "Subir Portada",
    "setup_store_name": "Nombre de la Tienda *",
    "setup_store_category": "Categoría de la Tienda *",
    "setup_phone": "Teléfono *",
    "setup_email": "Correo Electrónico",
    "setup_address": "Dirección *",
    "setup_door": "Puerta / Piso",
    "setup_postal_code": "Código Postal *",
    "setup_city": "Ciudad *",
    "setup_district": "Distrito *",
    "setup_exact_location": "Ubicación Exacta en el Mapa *"
  },
  fr: {
    "setup_step_store": "Boutique",
    "setup_step_hours": "Horaires",
    "setup_step_services": "Services",
    "setup_step_plan": "Plan",
    "setup_step_payments": "Paiements",
    "setup_step_review": "Révision",
    "setup_welcome": "Bienvenue sur Glamzo PRO",
    "setup_welcome_desc": "Configurons votre établissement en 6 étapes simples.",
    "setup_back": "Retour",
    "setup_continue": "Continuer",
    "setup_finish": "Terminer la configuration",
    "setup_images": "Images de la Boutique (Couverture et Profil)",
    "setup_upload_logo": "Télécharger le logo",
    "setup_upload_cover": "Télécharger la couverture",
    "setup_store_name": "Nom de la Boutique *",
    "setup_store_category": "Catégorie de la Boutique *",
    "setup_phone": "Téléphone *",
    "setup_email": "E-mail",
    "setup_address": "Adresse *",
    "setup_door": "Porte / Étage",
    "setup_postal_code": "Code Postal *",
    "setup_city": "Ville *",
    "setup_district": "District *",
    "setup_exact_location": "Emplacement exact sur la carte *"
  },
  de: {
    "setup_step_store": "Geschäft",
    "setup_step_hours": "Zeiten",
    "setup_step_services": "Dienstleistungen",
    "setup_step_plan": "Plan",
    "setup_step_payments": "Zahlungen",
    "setup_step_review": "Überprüfung",
    "setup_welcome": "Willkommen bei Glamzo PRO",
    "setup_welcome_desc": "Lassen Sie uns Ihr Geschäft in 6 einfachen Schritten einrichten.",
    "setup_back": "Zurück",
    "setup_continue": "Weiter",
    "setup_finish": "Einrichtung abschließen",
    "setup_images": "Geschäftsbilder (Titel und Profil)",
    "setup_upload_logo": "Logo hochladen",
    "setup_upload_cover": "Titelbild hochladen",
    "setup_store_name": "Geschäftsname *",
    "setup_store_category": "Geschäftskategorie *",
    "setup_phone": "Telefon *",
    "setup_email": "E-Mail",
    "setup_address": "Adresse *",
    "setup_door": "Tür / Etage",
    "setup_postal_code": "Postleitzahl *",
    "setup_city": "Stadt *",
    "setup_district": "Bezirk *",
    "setup_exact_location": "Genaue Lage auf der Karte *"
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

let setupCode = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

setupCode = setupCode.replace(/title: 'Loja'/g, "title: t('setup_step_store') || 'Loja'");
setupCode = setupCode.replace(/title: 'Horários'/g, "title: t('setup_step_hours') || 'Horários'");
setupCode = setupCode.replace(/title: 'Serviços'/g, "title: t('setup_step_services') || 'Serviços'");
setupCode = setupCode.replace(/title: 'Plano'/g, "title: t('setup_step_plan') || 'Plano'");
setupCode = setupCode.replace(/title: 'Pagamentos'/g, "title: t('setup_step_payments') || 'Pagamentos'");
setupCode = setupCode.replace(/title: 'Revisão'/g, "title: t('setup_step_review') || 'Revisão'");

setupCode = setupCode.replace(/Bem-vindo ao Glamzo PRO/g, "{t('setup_welcome') || 'Bem-vindo ao Glamzo PRO'}");
setupCode = setupCode.replace(/Vamos configurar o teu estabelecimento em 6 passos simples\./g, "{t('setup_welcome_desc') || 'Vamos configurar o teu estabelecimento em 6 passos simples.'}");

setupCode = setupCode.replace(/>Imagens do Estabelecimento \(Capa e Perfil\)</g, ">{t('setup_images') || 'Imagens do Estabelecimento (Capa e Perfil)'}<");
setupCode = setupCode.replace(/>Nome do Estabelecimento \*</g, ">{t('setup_store_name') || 'Nome do Estabelecimento *'}<");
setupCode = setupCode.replace(/>Categoria do Estabelecimento \*</g, ">{t('setup_store_category') || 'Categoria do Estabelecimento *'}<");
setupCode = setupCode.replace(/>Telefone \*</g, ">{t('setup_phone') || 'Telefone *'}<");
setupCode = setupCode.replace(/>E-mail</g, ">{t('setup_email') || 'E-mail'}<");
setupCode = setupCode.replace(/>Morada \*</g, ">{t('setup_address') || 'Morada *'}<");
setupCode = setupCode.replace(/>Nº Porta \/ Andar</g, ">{t('setup_door') || 'Nº Porta / Andar'}<");
setupCode = setupCode.replace(/>Código Postal \*</g, ">{t('setup_postal_code') || 'Código Postal *'}<");
setupCode = setupCode.replace(/>Cidade \*</g, ">{t('setup_city') || 'Cidade *'}<");
setupCode = setupCode.replace(/>Distrito \*</g, ">{t('setup_district') || 'Distrito *'}<");
setupCode = setupCode.replace(/>Localização Exata no Mapa \*</g, ">{t('setup_exact_location') || 'Localização Exata no Mapa *'}<");
setupCode = setupCode.replace(/Carregar Capa/g, "{t('setup_upload_cover') || 'Carregar Capa'}");
setupCode = setupCode.replace(/Carregar Logótipo/g, "{t('setup_upload_logo') || 'Carregar Logótipo'}");

// It already has useTranslation
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setupCode);


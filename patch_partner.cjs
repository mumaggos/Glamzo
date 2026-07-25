const fs = require('fs');

let content = fs.readFileSync('src/pages/Partner.tsx', 'utf8');

content = content.replace(/>Tudo o que precisa num só lugar\.</g, ">{t('partnerPage.featuresTitle')}<");
content = content.replace(/>O ecossistema perfeito desenhado para lhe devolver o tempo e aumentar o faturamento do seu espaço\.</g, ">{t('partnerPage.featuresSubtitle')}<");
content = content.replace(/>Controle horários, folgas e disponibilidades de cada profissional\. O sistema previne cruzamentos, organiza as pausas e envia lembretes automáticos por si\.</g, ">{t('partnerPage.feat1Desc')}<");

content = content.replace(/>Glamzo Pay</g, ">{t('partnerPage.feat2Title')}<");
content = content.replace(/>Fim aos cancelamentos falsos\. Cobre os serviços online com MBWay, Apple Pay e Cartão diretamente na plataforma\.</g, ">{t('partnerPage.feat2Desc')}<");

content = content.replace(/>Marketing & Vales</g, ">{t('partnerPage.feat3Title')}<");
content = content.replace(/>Crie cupões de desconto para atrair clientes em dias lentos e construa uma rede de fidelização sólida\.</g, ">{t('partnerPage.feat3Desc')}<");

content = content.replace(/>Mais Popular</g, ">{t('partnerPage.mostPopular')}<");
content = content.replace(/>\/mês</g, ">{t('partnerPage.perMonth')}<");
content = content.replace(/>Único</g, ">{t('partnerPage.oneTime')}<");

fs.writeFileSync('src/pages/Partner.tsx', content);
console.log('Patched Partner.tsx');

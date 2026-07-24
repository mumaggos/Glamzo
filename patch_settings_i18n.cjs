const fs = require('fs');

const mappings = {
  "Dados da loja atualizados com sucesso.": "succDataUpdated",
  "Erro ao atualizar dados da loja.": "errDataUpdate",
  "As novas passwords não coincidem.": "errPasswordsNoMatch",
  "A password deve ter pelo menos 6 caracteres.": "errPasswordLength",
  "Password alterada com sucesso.": "succPasswordChanged",
  "Erro ao alterar a password.": "errPasswordChange",
  "Imagens guardadas com sucesso na Cloud!": "succImagesSaved",
  "Erro! Garanta que o bucket \"business-images\" é Público no teu Supabase.": "errBucketPublic",
  "Regras de agendamento atualizadas com sucesso.": "succRulesUpdated",
  "Erro ao atualizar regras.": "errRulesUpdate",
  "Configurações": "title",
  "Ajuste as preferências da sua conta, imagens de montra e regras.": "subtitle",
  "Dados da Loja": "tabStoreData",
  "Segurança": "tabSecurity",
  "Imagens": "tabImages",
  "Regras de Agendamento": "tabRules",
  "Nome da Loja": "storeName",
  "Morada Completa": "fullAddress",
  "Porta / Andar": "doorNumber",
  "Código Postal": "postalCode",
  "Cidade": "city",
  "Telefone": "phone",
  "EUR - Euro (€)": "currencyEur",
  "GBP - Libra (£)": "currencyGbp",
  "USD - Dólar ($)": "currencyUsd",
  "BRL - Real (R$)": "currencyBrl",
  "Email": "email",
  "Alterar Password": "changePassword",
  "A sua conta é gerida de forma segura pelo Google.": "googleManaged",
  "Password Atual": "currentPassword",
  "Nova Password": "newPassword",
  "Repetir Nova Password": "repeatNewPassword",
  "Imagens e Logótipo": "imagesTitle",
  "Logótipo": "logo",
  "Escolher Logótipo": "chooseLogo",
  "Capa da Loja": "storeCover",
  "Sem imagem de capa": "noCover",
  "Escolher Capa": "chooseCover",
  "Antecedência Mínima para Marcação": "minAdvanceTime",
  "Sem restrição": "noRestriction",
  "30 minutos": "min30",
  "1 hora": "hour1",
  "2 horas": "hours2",
  "24 horas": "hours24",
  "Política de Cancelamento": "cancellationPolicy",
  "Flexível (Permitido até 2h antes)": "flexiblePolicy",
  "Moderada (Permitido até 12h antes)": "moderatePolicy",
  "Rigorosa (Permitido até 24h antes)": "strictPolicy",
  "Limite de Aceitação de Reservas": "bookingLimit",
  "Normal (Não exceder a hora de fecho)": "normalLimit",
  "Até à hora de fecho em ponto": "exactClosingLimit",
  "Parar de receber 30 min antes do fecho": "stop30mBefore",
  "Parar de receber 1 hora antes do fecho": "stop1hBefore",
  "Controla se o serviço pode ultrapassar a hora de fecho ou se deve terminar antes.": "bookingLimitDesc",
  "E-mail de Contacto": "contactEmail",
  "Guardar Dados": "saveData",
  "Guardar Password": "savePassword",
  "Guardar Imagens": "saveImages",
  "Guardar Regras": "saveRules",
};

const { Project, SyntaxKind } = require('ts-morph');
const project = new Project();
project.addSourceFilesAtPaths(['src/pages/partner/tabs/SettingsTab.tsx']);

const file = project.getSourceFiles()[0];
const namespace = 'settings';

file.forEachDescendant(node => {
  if (node.wasForgotten()) return;

  if (node.getKind() === SyntaxKind.JsxText) {
    const text = node.getText();
    const trimmed = text.trim();
    if (mappings[trimmed]) {
      const leading = text.substring(0, text.indexOf(trimmed));
      const trailing = text.substring(text.indexOf(trimmed) + trimmed.length);
      node.replaceWithText(`${leading}{t('${namespace}.${mappings[trimmed]}')}${trailing}`);
    }
  } else if (node.getKind() === SyntaxKind.JsxAttribute) {
    const nameNode = node.getNameNode();
    if (nameNode) {
      const name = nameNode.getText();
      if (['placeholder', 'label', 'value'].includes(name)) {
        const init = node.getInitializer();
        if (init && init.getKind() === SyntaxKind.StringLiteral) {
          const val = init.getLiteralText();
          if (mappings[val]) {
            init.replaceWithText(`{t('${namespace}.${mappings[val]}')}`);
          }
        }
      }
    }
  } else if (node.getKind() === SyntaxKind.CallExpression) {
    const exp = node.getExpression().getText();
    if (exp === 'showMessage') {
      const args = node.getArguments();
      if (args[1] && args[1].getKind() === SyntaxKind.StringLiteral) {
        const val = args[1].getLiteralText();
        if (mappings[val]) {
          args[1].replaceWithText(`t('${namespace}.${mappings[val]}')`);
        }
      }
    }
  }
});

file.saveSync();

// Reverse dictionary for i18n
const reverseDict = {};
for (const [k, v] of Object.entries(mappings)) {
  reverseDict[v] = k;
}

let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
const langs = ['en', 'pt', 'es', 'fr'];
for (const lang of langs) {
  const regex = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{)`, 'g');
  let stringified = JSON.stringify(reverseDict, null, 12).slice(1, -1);
  i18n = i18n.replace(regex, `$1\n          settings: {${stringified}},`);
}

fs.writeFileSync('src/i18n.ts', i18n);


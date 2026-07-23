const fs = require('fs');
const path = require('path');

const dictionary = {
  "Cancelar": "cancel",
  "Guardar": "save",
  "Editar": "edit",
  "Apagar": "delete",
  "Confirmar": "confirm",
  "Adicionar": "add",
  "Remover": "remove",
  "Fechar": "close",
  "Pesquisar": "search",
  "Voltar": "back",
  "Continuar": "continue",
  "Terminar": "finish",
  "Submeter": "submit",
  "Atualizar": "update",
  "Detalhes": "details",
  "Ver Tudo": "view_all",
  "Nenhuma marcação": "no_bookings",
  "Sem horários disponíveis": "no_available_times",
  "Ainda não tem reservas": "no_reservations_yet",
  "Ocorreu um erro": "error_occurred",
  "A carregar...": "loading",
  "Carregar mais": "load_more",
  "Não existem dados": "no_data"
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [pt, key] of Object.entries(dictionary)) {
        // Replace in JSX Text >Text<
        const jsxRegex = new RegExp(`>\\s*${pt}\\s*<`, 'g');
        if (jsxRegex.test(content)) {
          content = content.replace(jsxRegex, `>{t('${key}') || '${pt}'}<`);
          changed = true;
        }
        
        // Replace in toast('Text')
        const toastRegex = new RegExp(`toast\\(['"\`]${pt}['"\`]\\)`, 'g');
        if (toastRegex.test(content)) {
          content = content.replace(toastRegex, `toast(t('${key}') || '${pt}')`);
          changed = true;
        }
      }

      if (changed) {
        if (!content.includes('useTranslation')) {
          content = content.replace(/(import.*?;)/, "$1\nimport { useTranslation } from 'react-i18next';");
          content = content.replace(/(export default function [a-zA-Z0-9_]+\s*\([^)]*\)\s*\{)/, "$1\n  const { t } = useTranslation();");
        }
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDirectory('/app/applet/src');
console.log('Swept all files.');

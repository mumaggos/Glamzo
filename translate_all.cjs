const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

const translations = {};
let keyCounter = 1;

function generateKey(str) {
  let clean = str.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').substring(0, 30);
  if (clean.endsWith('_')) clean = clean.substring(0, clean.length - 1);
  if (clean.startsWith('_')) clean = clean.substring(1);
  if (!clean) clean = 'text';
  return 'txt_' + clean + '_' + keyCounter++;
}

function shouldTranslate(str) {
  if (str.length < 2) return false;
  if (str.startsWith('/')) return false; 
  if (str.startsWith('http')) return false;
  if (/^[0-9\.\,]+$/.test(str)) return false; // numbers
  if (str.includes('_') || str.includes('=>') || str.includes('return ')) return false; // code
  if (/^[a-z][A-Z]/.test(str)) return false; // camelCase
  if (/^[a-z]+$/.test(str) && !str.includes(' ') && !['pt', 'en', 'es', 'fr', 'de'].includes(str)) return false; // all lowercase single word, typically code/key unless it's a known short word. But to be safe let's skip.
  return true;
}

const ignoreList = ['yyyy-MM-dd', 'HH:mm', 'mm', 'HH', 'auto', 'pt-PT', 'PT', 'EN', 'ES', 'FR', 'DE'];

let total = 0;
project.getSourceFiles().forEach(sourceFile => {
  let fileChanged = false;
  
  const hasUseTranslation = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === 'react-i18next');
  
  const processText = (text, replacer) => {
    const trimmed = text.trim();
    if (trimmed && shouldTranslate(trimmed) && !ignoreList.includes(trimmed)) {
       if (!trimmed.startsWith('{') && !trimmed.startsWith('(') && !trimmed.includes('}')) {
          const key = generateKey(trimmed);
          translations[key] = trimmed;
          replacer(trimmed, key);
          fileChanged = true;
       }
    }
  };

  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  jsxTexts.forEach(jsxText => {
    const text = jsxText.getLiteralText();
    processText(text, (trimmed, key) => {
        const leadingSpace = text.substring(0, text.indexOf(trimmed));
        const trailingSpace = text.substring(text.indexOf(trimmed) + trimmed.length);
        jsxText.replaceWithText(`${leadingSpace}{t('${key}') || '${trimmed.replace(/'/g, "\\'")}'}${trailingSpace}`);
    });
  });

  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  jsxAttributes.forEach(attr => {
    const nameNode = attr.getNameNode();
    if (!nameNode) return;
    const name = nameNode.getText();
    if (['placeholder', 'label', 'title', 'alt'].includes(name)) {
      const init = attr.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        const text = init.getLiteralValue();
        processText(text, (trimmed, key) => {
            attr.setInitializer(`{t('${key}') || '${trimmed.replace(/'/g, "\\'")}'}`);
        });
      }
    }
  });

  if (fileChanged) {
    if (!hasUseTranslation) {
      sourceFile.addImportDeclaration({
        namedImports: ['useTranslation'],
        moduleSpecifier: 'react-i18next'
      });
    }
    // We can add `const { t } = useTranslation();` manually where needed or skip it for now and fix compile errors later. 
    // Actually, adding it to all exported components is easy using regex on the saved file.
    sourceFile.saveSync();
  }
});

fs.writeFileSync('extracted_keys.json', JSON.stringify(translations, null, 2));
console.log('Keys extracted: ', Object.keys(translations).length);

const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const mappings = require('./mappings.cjs');

const project = new Project();
project.addSourceFilesAtPaths(['src/pages/partner/SetupWizard.tsx', 'src/pages/partner/tabs/AgendaTab.tsx']);

for (const file of project.getSourceFiles()) {
  const isSetup = file.getBaseName() === 'SetupWizard.tsx';
  const namespace = isSetup ? 'setupWizard' : 'agenda';
  const dict = mappings[namespace];

  // Inject import if not exists
  const hasI18n = file.getImportDeclaration(decl => decl.getModuleSpecifierValue() === 'react-i18next');
  if (!hasI18n) {
    file.addImportDeclaration({
      namedImports: ['useTranslation'],
      moduleSpecifier: 'react-i18next'
    });
  }

  // Inject const { t } = useTranslation(); into main component
  const compName = isSetup ? 'SetupWizard' : 'AgendaTab';
  const mainFunc = file.getFunction(compName);
  if (mainFunc) {
    const hasT = mainFunc.getVariableStatement(stmt => stmt.getText().includes('useTranslation'));
    if (!hasT) {
      mainFunc.insertStatements(0, 'const { t } = useTranslation();');
    }
  }

  // Replace text
  file.forEachDescendant(node => {
    if (node.wasForgotten()) return;

    // JSXText
    if (node.getKind() === SyntaxKind.JsxText) {
      const text = node.getText();
      const trimmed = text.trim();
      if (dict[trimmed]) {
        // preserve whitespace around
        const leading = text.substring(0, text.indexOf(trimmed));
        const trailing = text.substring(text.indexOf(trimmed) + trimmed.length);
        node.replaceWithText(`${leading}{t('${namespace}.${dict[trimmed]}')}${trailing}`);
      }
    } 
    // JSXAttribute placeholder, label, value
    else if (node.getKind() === SyntaxKind.JsxAttribute) {
      const nameNode = node.getNameNode();
      if (nameNode) {
        const name = nameNode.getText();
        if (['placeholder', 'label', 'value'].includes(name)) {
          const init = node.getInitializer();
          if (init && init.getKind() === SyntaxKind.StringLiteral) {
            const val = init.getLiteralText();
            if (dict[val]) {
              init.replaceWithText(`{t('${namespace}.${dict[val]}')}`);
            }
          }
        }
      }
    }
    // CallExpressions: toast.error, toast.success, alert, setErrorMsg, setSuccessMsg, notifyTerminal
    else if (node.getKind() === SyntaxKind.CallExpression) {
      const exp = node.getExpression().getText();
      if (['toast.error', 'toast.success', 'alert', 'setErrorMsg', 'setSuccessMsg', 'notifyTerminal'].includes(exp)) {
        const args = node.getArguments();
        
        // Handle first arg
        if (args[0] && args[0].getKind() === SyntaxKind.StringLiteral) {
          const val = args[0].getLiteralText();
          if (dict[val]) {
            args[0].replaceWithText(`t('${namespace}.${dict[val]}')`);
          }
        } else if (args[0] && args[0].getKind() === SyntaxKind.BinaryExpression) {
          // If it's something like 'Erro ao preparar a configuração da loja: ' + err.message
          const left = args[0].getLeft();
          if (left && left.getKind() === SyntaxKind.StringLiteral) {
            const val = left.getLiteralText();
            if (dict[val]) {
              left.replaceWithText(`t('${namespace}.${dict[val]}')`);
            }
          }
        }
        
        // Handle notifyTerminal second arg
        if (exp === 'notifyTerminal' && args[1] && args[1].getKind() === SyntaxKind.StringLiteral) {
          const val = args[1].getLiteralText();
          if (dict[val]) {
            args[1].replaceWithText(`t('${namespace}.${dict[val]}')`);
          }
        }
      }
    }
  });

  file.saveSync();
}
console.log("Done modifying AST.");

const { Project, SyntaxKind } = require('ts-morph');
const project = new Project();
project.addSourceFilesAtPaths(['src/pages/partner/SetupWizard.tsx', 'src/pages/partner/tabs/AgendaTab.tsx']);

const strings = { setupWizard: [], agenda: [] };

for (const file of project.getSourceFiles()) {
  const isSetup = file.getBaseName() === 'SetupWizard.tsx';
  const list = isSetup ? strings.setupWizard : strings.agenda;
  file.forEachDescendant(node => {
    if (node.getKind() === SyntaxKind.JsxText) {
      const text = node.getText().trim();
      if (text && /[a-zA-Z]/.test(text) && !text.includes('{') && !text.includes('}')) {
        list.push(text);
      }
    } else if (node.getKind() === SyntaxKind.JsxAttribute) {
      const nameNode = node.getNameNode();
      const name = nameNode ? nameNode.getText() : null;
      if (name === 'placeholder' || name === 'label') {
        const init = node.getInitializer();
        if (init && init.getKind() === SyntaxKind.StringLiteral) {
          list.push(init.getLiteralText());
        }
      }
    }
  });
}

console.log(JSON.stringify(strings, null, 2));

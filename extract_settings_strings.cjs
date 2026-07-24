const { Project, SyntaxKind } = require('ts-morph');
const project = new Project();
project.addSourceFilesAtPaths(['src/pages/partner/tabs/SettingsTab.tsx']);

const strings = new Set();
const file = project.getSourceFiles()[0];

file.forEachDescendant(node => {
  if (node.getKind() === SyntaxKind.JsxText) {
    const text = node.getText().trim();
    if (text && /[a-zA-Z]/.test(text) && !text.includes('{') && !text.includes('}')) {
      strings.add(text);
    }
  } else if (node.getKind() === SyntaxKind.JsxAttribute) {
    const nameNode = node.getNameNode();
    const name = nameNode ? nameNode.getText() : null;
    if (name === 'placeholder' || name === 'label') {
      const init = node.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        strings.add(init.getLiteralText());
      }
    }
  } else if (node.getKind() === SyntaxKind.CallExpression) {
    const exp = node.getExpression().getText();
    if (exp === 'showMessage') {
      const args = node.getArguments();
      if (args[1] && args[1].getKind() === SyntaxKind.StringLiteral) {
        strings.add(args[1].getLiteralText());
      }
    }
  }
});

console.log(JSON.stringify(Array.from(strings), null, 2));

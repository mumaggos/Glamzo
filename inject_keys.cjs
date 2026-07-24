const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project();
project.addSourceFilesAtPaths("src/i18n.ts");

const sourceFile = project.getSourceFileOrThrow("src/i18n.ts");
const newKeys = JSON.parse(fs.readFileSync('extracted_keys.json', 'utf8'));

// Find resources variable
const resourcesVar = sourceFile.getVariableDeclarationOrThrow('resources');
const resourcesObj = resourcesVar.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

['en', 'pt', 'es', 'fr', 'de'].forEach(lang => {
  const langProp = resourcesObj.getProperty(lang);
  if (langProp && langProp.getKind() === SyntaxKind.PropertyAssignment) {
    const langObj = langProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
    if (langObj) {
      const translationProp = langObj.getProperty('translation');
      if (translationProp && translationProp.getKind() === SyntaxKind.PropertyAssignment) {
        const transObj = translationProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
        if (transObj) {
          // get existing keys to avoid duplicates
          const existingKeys = new Set(transObj.getProperties().map(p => {
             if (p.getKind() === SyntaxKind.PropertyAssignment) {
                const nameNode = p.getNameNode();
                if (nameNode.getKind() === SyntaxKind.StringLiteral) return nameNode.getLiteralText();
                if (nameNode.getKind() === SyntaxKind.Identifier) return nameNode.getText();
             }
             return null;
          }).filter(Boolean));
          
          for (const [key, ptValue] of Object.entries(newKeys)) {
            if (!existingKeys.has(key)) {
              // We could do basic translations here, or just insert ptValue
              // For simplicity, let's just insert ptValue for all to fix the white screen / raw keys issue.
              transObj.addPropertyAssignment({
                name: `"${key}"`,
                initializer: `"${ptValue.replace(/"/g, '\\"')}"`
              });
            }
          }
        }
      }
    }
  }
});

sourceFile.saveSync();
console.log("Keys injected successfully.");

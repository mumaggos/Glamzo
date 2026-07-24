const { Project, SyntaxKind } = require('ts-morph');
const project = new Project();
project.addSourceFilesAtPaths("src/emails/GlamzoTemplates.tsx");
project.addSourceFilesAtPaths("src/pages/partner/tabs/ClientsTab.tsx");
project.addSourceFilesAtPaths("src/pages/partner/tabs/ReservationsTab.tsx");

project.getSourceFiles().forEach(sourceFile => {
  let changed = false;

  const ensureBlock = (func) => {
    const body = func.getBody();
    if (body && body.getKind() !== SyntaxKind.Block) {
      if (func.getKind() === SyntaxKind.ArrowFunction) {
        const bodyText = body.getFullText();
        func.replaceWithText(`(${func.getParameters().map(p => p.getText()).join(', ')}) => {\n  const { t } = useTranslation();\n  return ${bodyText};\n}`);
        changed = true;
      }
    } else if (body && body.getKind() === SyntaxKind.Block) {
      if (!body.getFullText().includes('useTranslation')) {
         body.insertStatements(0, "const { t } = useTranslation();");
         changed = true;
      }
    }
  };

  sourceFile.getFunctions().forEach(func => {
    const name = func.getName() || '';
    if (name.charAt(0) === name.charAt(0).toUpperCase()) ensureBlock(func);
  });

  sourceFile.getVariableDeclarations().forEach(vd => {
    const name = vd.getName();
    if (typeof name === 'string' && name.charAt(0) === name.charAt(0).toUpperCase()) {
      const init = vd.getInitializer();
      if (init) {
        if (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression) {
          ensureBlock(init);
        } else if (init.getKind() === SyntaxKind.CallExpression) {
          const args = init.getArguments();
          if (args.length > 0 && (args[0].getKind() === SyntaxKind.ArrowFunction || args[0].getKind() === SyntaxKind.FunctionExpression)) {
            ensureBlock(args[0]);
          }
        }
      }
    }
  });

  if (changed) sourceFile.saveSync();
});

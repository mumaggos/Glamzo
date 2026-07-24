const { Project, SyntaxKind } = require('ts-morph');

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

project.getSourceFiles().forEach(sourceFile => {
  let changed = false;

  // Remove existing `const { t } = useTranslation();`
  sourceFile.getDescendantsOfKind(SyntaxKind.VariableStatement).forEach(vs => {
    if (vs.getText().replace(/\s+/g, '') === 'const{t}=useTranslation();') {
      vs.remove();
      changed = true;
    }
  });

  if (!sourceFile.getFullText().includes('t(')) {
    if (changed) sourceFile.saveSync();
    return;
  }

  // Ensure import
  const hasImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === 'react-i18next');
  if (!hasImport) {
    sourceFile.addImportDeclaration({
      namedImports: ['useTranslation'],
      moduleSpecifier: 'react-i18next'
    });
    changed = true;
  } else {
    const hasNamed = hasImport.getNamedImports().some(ni => ni.getName() === 'useTranslation');
    if (!hasNamed) {
      hasImport.addNamedImport('useTranslation');
      changed = true;
    }
  }

  const injectT = (body) => {
    if (body && body.getKind() === SyntaxKind.Block) {
      if (body.getFullText().includes('t(')) {
         body.insertStatements(0, "const { t } = useTranslation();");
         changed = true;
      }
    }
  };

  sourceFile.getFunctions().forEach(func => {
    const name = func.getName() || '';
    if (name.charAt(0) === name.charAt(0).toUpperCase() || name.startsWith('use') || func.isDefaultExport()) {
      injectT(func.getBody());
    }
  });

  sourceFile.getVariableDeclarations().forEach(vd => {
    const name = vd.getName();
    // Usually name is a string, but could be pattern. We just skip if it's a pattern.
    if (typeof name === 'string' && (name.charAt(0) === name.charAt(0).toUpperCase() || name.startsWith('use'))) {
      const init = vd.getInitializer();
      if (init && (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression)) {
        injectT(init.getBody());
      }
    }
  });

  if (changed) {
    sourceFile.saveSync();
  }
});

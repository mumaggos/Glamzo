const { Project, SyntaxKind } = require('ts-morph');

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

let changedFiles = 0;

project.getSourceFiles().forEach(sourceFile => {
  const text = sourceFile.getFullText();
  
  // If we don't use t( or t. we probably don't need useTranslation (except if someone imported it manually)
  // Let's just check if it contains `t(` or `{t(` or ` t(`
  if (!text.includes('t(')) {
    return;
  }

  let fileChanged = false;

  // Add import if missing
  const hasImport = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === 'react-i18next');
  if (!hasImport) {
    sourceFile.addImportDeclaration({
      namedImports: ['useTranslation'],
      moduleSpecifier: 'react-i18next'
    });
    fileChanged = true;
  } else {
    // Check if it specifically imports useTranslation
    const importsUseTranslation = hasImport.getNamedImports().some(ni => ni.getName() === 'useTranslation');
    if (!importsUseTranslation) {
      hasImport.addNamedImport('useTranslation');
      fileChanged = true;
    }
  }

  // Find where `t` is used, and inject `const { t } = useTranslation();` in the closest function body
  // However, simpler approach:
  // Iterate all functions and arrow functions that look like components (return JSX) or use `t`.
  
  const injectT = (body) => {
    if (body && body.getKind() === SyntaxKind.Block) {
      const bodyText = body.getFullText();
      // Check if `t(` is used inside this block
      if (bodyText.includes('t(')) {
        const hasT = body.getVariableDeclarations().some(v => v.getName() === 't');
        if (!hasT) {
          body.insertStatements(0, "const { t } = useTranslation();");
          fileChanged = true;
        }
      }
    }
  };

  sourceFile.getFunctions().forEach(func => {
    injectT(func.getBody());
  });

  sourceFile.getVariableDeclarations().forEach(vd => {
    const init = vd.getInitializer();
    if (init && init.getKind() === SyntaxKind.ArrowFunction) {
      injectT(init.getBody());
    } else if (init && init.getKind() === SyntaxKind.FunctionExpression) {
      injectT(init.getBody());
    }
  });

  if (fileChanged) {
    sourceFile.saveSync();
    changedFiles++;
    console.log(`Fixed: ${sourceFile.getFilePath()}`);
  }
});

console.log(`Fixed ${changedFiles} files.`);

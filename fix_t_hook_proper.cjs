const { Project, SyntaxKind } = require('ts-morph');

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");
project.addSourceFilesAtPaths("src/**/*.ts");

let changedFiles = 0;

project.getSourceFiles().forEach(sourceFile => {
  const text = sourceFile.getFullText();
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
    const importsUseTranslation = hasImport.getNamedImports().some(ni => ni.getName() === 'useTranslation');
    if (!importsUseTranslation) {
      hasImport.addNamedImport('useTranslation');
      fileChanged = true;
    }
  }

  // Remove `const { t } = useTranslation();` from ALL places first to clean up bad injections
  sourceFile.getDescendantsOfKind(SyntaxKind.VariableStatement).forEach(vs => {
    if (vs.getText().includes('const { t } = useTranslation()')) {
      vs.remove();
      fileChanged = true;
    }
  });

  // Now, find React components (Functions or ArrowFunctions assigned to variables starting with Capital letter)
  // Or default exported functions.
  
  const injectIntoBody = (body, isComponent) => {
    if (body && body.getKind() === SyntaxKind.Block) {
       const bodyText = body.getFullText();
       if (bodyText.includes('t(')) {
          // If it's a component or custom hook (starts with use), inject at top
          if (isComponent) {
            body.insertStatements(0, "const { t } = useTranslation();");
            fileChanged = true;
          }
       }
    }
  }

  sourceFile.getFunctions().forEach(func => {
    const name = func.getName() || '';
    const isComponent = name.charAt(0) === name.charAt(0).toUpperCase() || name.startsWith('use') || func.isDefaultExport();
    injectIntoBody(func.getBody(), isComponent);
  });

  sourceFile.getVariableDeclarations().forEach(vd => {
    const name = vd.getName();
    const isComponent = name.charAt(0) === name.charAt(0).toUpperCase() || name.startsWith('use');
    const init = vd.getInitializer();
    if (init && init.getKind() === SyntaxKind.ArrowFunction) {
      injectIntoBody(init.getBody(), isComponent);
    } else if (init && init.getKind() === SyntaxKind.FunctionExpression) {
      injectIntoBody(init.getBody(), isComponent);
    }
  });

  if (fileChanged) {
    sourceFile.saveSync();
    changedFiles++;
    console.log(`Fixed: ${sourceFile.getFilePath()}`);
  }
});

console.log(`Fixed ${changedFiles} files.`);

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "class ErrorBoundary extends React.Component<{children: React.ReactNode}, any> {\n  state = { hasError: false };\n  static getDerivedStateFromError() { return { hasError: true }; }\n  render() {\n    if (this.state.hasError) return <div className=\"p-10 text-red-600 font-bold\">Ocorreu um erro no carregamento da página. Por favor, recarregue.</div>;\n    return (this as any).props.children;\n  }",
  `class ErrorBoundary extends React.Component<{children: React.ReactNode}, any> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div className="p-10 text-red-600 font-bold">
        <h1>Ocorreu um erro no carregamento da página. Por favor, recarregue.</h1>
        <pre className="mt-4 text-xs bg-red-50 p-4 rounded overflow-auto">{this.state.error?.toString()}</pre>
        <pre className="mt-4 text-xs bg-red-50 p-4 rounded overflow-auto">{this.state.error?.stack}</pre>
      </div>
    );
    return (this as any).props.children;
  }
}`
);

fs.writeFileSync('src/App.tsx', code);

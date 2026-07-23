const fs = require('fs');

// Fix ErrorBoundary
const ebCode = `
import React, { Component, ErrorInfo, ReactNode } from "react";
import { useTranslation } from 'react-i18next';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  t?: any;
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">{this.props.t('error_occurred') || 'Ocorreu um erro ao carregar este componente.'}</div>;
    }
    return this.props.children;
  }
}

export default function ErrorBoundary(props: Omit<Props, 't'>) {
  const { t } = useTranslation();
  return <ErrorBoundaryInner {...props} t={t} />;
}
`;
fs.writeFileSync('/app/applet/src/components/ErrorBoundary.tsx', ebCode);

// Fix PartnerLayout double import
let plCode = fs.readFileSync('/app/applet/src/components/partner/PartnerLayout.tsx', 'utf8');
plCode = plCode.replace(/import { useTranslation } from 'react-i18next';\nimport { useTranslation } from 'react-i18next';/, "import { useTranslation } from 'react-i18next';");
fs.writeFileSync('/app/applet/src/components/partner/PartnerLayout.tsx', plCode);

// Fix FinanceTab missing t
let ftCode = fs.readFileSync('/app/applet/src/pages/partner/tabs/FinanceTab.tsx', 'utf8');
if (!ftCode.includes('useTranslation')) {
  ftCode = ftCode.replace(/(import.*?;)/, "$1\nimport { useTranslation } from 'react-i18next';");
  ftCode = ftCode.replace(/(export default function FinanceTab\s*\([^)]*\)\s*\{)/, "$1\n  const { t } = useTranslation();");
}
fs.writeFileSync('/app/applet/src/pages/partner/tabs/FinanceTab.tsx', ftCode);

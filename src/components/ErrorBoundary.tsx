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
      return (this as any).props.fallback || <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">{(this as any).props.t ? (this as any).props.t('error_occurred') : 'Ocorreu um erro ao carregar este componente.'}</div>;
    }
    return (this as any).props.children;
  }
}

export default function ErrorBoundary(props: Omit<Props, 't'>) {
  const { t } = useTranslation();
  return <ErrorBoundaryInner {...props} t={t} />;
}

import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          {t('error_boundary.title')}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
          {t('error_boundary.description')}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {t('error_boundary.retry')}
        </button>
      </div>
    </div>
  );
};

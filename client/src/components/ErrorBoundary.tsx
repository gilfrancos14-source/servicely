import { Component, type ReactNode, type ErrorInfo } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-error mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Une erreur est survenue</h1>
            <p className="text-on-surface-variant mb-6">
              {this.state.error?.message || "L'application a rencontré une erreur inattendue."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-secondary text-on-secondary rounded-lg font-button hover:opacity-90 transition-all"
              >
                Recharger la page
              </button>
              <Link
                to="/"
                className="px-6 py-3 border border-secondary text-secondary rounded-lg font-button hover:bg-secondary/5 transition-all"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Accueil
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

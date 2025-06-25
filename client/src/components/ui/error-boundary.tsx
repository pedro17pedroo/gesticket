import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Algo deu errado</AlertTitle>
            <AlertDescription className="mt-2">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
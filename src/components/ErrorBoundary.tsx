import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warn/10 text-warn">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-[18px] font-semibold tracking-tight text-ink-1">
            Coś poszło nie tak
          </h1>
          <p className="mt-2 text-sm text-ink-3">
            Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę albo wrócić do widoku głównego.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 overflow-auto rounded-md bg-surface-2 p-3 text-left text-[11px] text-ink-2">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => location.reload()}>
              Odśwież stronę
            </Button>
            <Button size="sm" onClick={this.reset}>
              Spróbuj ponownie
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

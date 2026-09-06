import { Component, Suspense, type ReactNode } from 'react';

class PageErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div role="alert" className="mx-auto max-w-md p-6 space-y-3">
          <h2 className="font-bold text-lg">This page could not be loaded</h2>
          <p className="text-sm text-muted-foreground">
            Check your connection and reload. Your saved progress stays on this device.
          </p>
          <button
            onClick={() => { window.location.reload(); }}
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2 font-semibold"
          >
            Reload page
          </button>
        </div>
      );
    return this.props.children;
  }
}

export function PageBoundary({ children }: { children: ReactNode }) {
  return (
    <PageErrorBoundary>
      <Suspense
        fallback={
          <div role="status" className="p-6 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        {children}
      </Suspense>
    </PageErrorBoundary>
  );
}

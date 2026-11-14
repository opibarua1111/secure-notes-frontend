import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { PageMeta } from './types';

// last line of defence so a render crash shows a message instead of a blank page
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main>
        <section>
          <h3>Something went wrong</h3>
          <p>Reload the page and try again.</p>
          <button onClick={() => location.reload()}>Reload</button>
        </section>
      </main>
    );
  }
}

export function Pager({ meta, onPage }: { meta: PageMeta | null; onPage: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return meta ? <p className="muted">{meta.total} total</p> : null;
  return (
    <div className="pager">
      <button disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        Prev
      </button>
      <span>
        Page {meta.page} of {meta.totalPages} ({meta.total} total)
      </span>
      <button disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
        Next
      </button>
    </div>
  );
}

export const ErrorText = ({ message }: { message: string }) =>
  message ? (
    <p className="error" role="alert">
      {message}
    </p>
  ) : null;

export const parseInterests = (raw: string): string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

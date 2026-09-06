import { lazy } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageBoundary } from './PageBoundary';

describe('on-demand screen loading', () => {
  afterEach(() => vi.restoreAllMocks());
  it('announces loading while keeping the surrounding navigation available', () => {
    const Page = lazy(() => new Promise<{ default: () => React.ReactNode }>(() => undefined));
    render(
      <>
        <nav>Navigation</nav>
        <PageBoundary>
          <Page />
        </PageBoundary>
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
    expect(screen.getByRole('navigation')).toHaveTextContent('Navigation');
  });
  it('shows a recoverable error if an uncached screen cannot download', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Page = lazy(() => Promise.reject(new Error('Offline')));
    render(
      <PageBoundary>
        <Page />
      </PageBoundary>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded');
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
  });
});

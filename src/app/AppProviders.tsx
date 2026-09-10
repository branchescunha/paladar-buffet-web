import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { queryClient } from './query-client';
import { GlobalStyle } from '@/styles/global';
import { ThemeModeProvider } from '@/styles/ThemeModeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary fallback={<div role="alert">Não foi possível carregar esta área.</div>}>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          <GlobalStyle />
          {children}
        </ThemeModeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

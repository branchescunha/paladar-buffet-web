import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { ErrorBoundary } from 'react-error-boundary';
import { queryClient } from './query-client';
import { theme } from '@/styles/theme';
import { GlobalStyle } from '@/styles/global';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary fallback={<div role="alert">Nao foi possivel carregar esta area.</div>}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

'use client';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export default function QueryProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60, // 1 hour
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
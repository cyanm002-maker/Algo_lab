import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LessonPage from './pages/LessonPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LessonPage />
    </QueryClientProvider>
  );
}

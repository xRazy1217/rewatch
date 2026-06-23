import { QueryClient } from '@tanstack/react-query'

function exponentialBackoff(attemptIndex: number) {
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: 2,
      retryDelay: exponentialBackoff,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      throwOnError: true,
      // Set a reasonable timeout for all queries
      networkMode: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: exponentialBackoff,
    },
  },
})

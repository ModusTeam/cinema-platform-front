import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/model/AuthContext'
import { PresentationProvider } from '@/features/presentation/model/PresentationContext'
import { ToastProvider } from '@/shared/ui/toast/ToastContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof Error) {
          const message = error.message.toLowerCase()
          if (message.includes('vite_api_url') || message.includes('network')) {
            return false
          }
        }
        return failureCount < 1
      },
      staleTime: 5 * 60 * 1000,
    },
  },
})

const DevelopmentApp = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <AuthProvider>
        <PresentationProvider>
          <RouterProvider router={router} />
        </PresentationProvider>
      </AuthProvider>
    </ToastProvider>
  </QueryClientProvider>
)

export default DevelopmentApp

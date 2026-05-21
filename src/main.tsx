import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ToastProvider } from './common/components/Toast/ToastContext'
import { AuthProvider } from './features/auth/AuthContext'
import './index.css'

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

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ToastProvider>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</ToastProvider>
		</QueryClientProvider>
	</StrictMode>,
)

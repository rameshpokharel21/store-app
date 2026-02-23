import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {ErrorProvider} from "./utils/ErrorProvider.jsx";
import AuthProvider from './contexts/AuthProvider.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000*2**attemptIndex, 30000),
      staleTime: 2 * 60 * 1000,
      gcTime: 10*60*1000,
    },
    mutations: {
      retry: 1,
    }
  }
});


createRoot(document.getElementById('root')).render(
  <QueryClientProvider client ={queryClient}>
    <ErrorProvider>
      <AuthProvider>
         <StrictMode>
          <App />
        </StrictMode>
      </AuthProvider>
    </ErrorProvider>
  </QueryClientProvider>
)

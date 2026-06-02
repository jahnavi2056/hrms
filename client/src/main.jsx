import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1d2e', color: '#f1f3f9', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', fontSize: '13px', padding: '12px 16px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0e1020' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0e1020' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

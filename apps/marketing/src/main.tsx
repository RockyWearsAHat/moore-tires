import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@moore-tires/shared';
import { ToastProvider } from '@moore-tires/shared';
import { CartProvider } from './context/CartContext.js';
import { App } from './App.js';
import './index.css';

const storedTheme = localStorage.getItem('marketing-theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
document.documentElement.dataset['theme'] = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : preferredTheme;

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

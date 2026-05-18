import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, ToastProvider } from '@moore-tires/shared';
import { App } from './App';
import './index.css';

const storedTheme = localStorage.getItem('dashboard-theme');
const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
document.documentElement.dataset['theme'] = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : preferredTheme;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);

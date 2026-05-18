import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary, ToastContainer } from '@moore-tires/shared';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { Services } from './pages/Services.js';
import { About } from './pages/About.js';
import { Contact } from './pages/Contact.js';
import { Book } from './pages/Book.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Tires from './pages/Tires.js';
import Cart from './pages/Cart.js';
import Checkout from './pages/Checkout.js';
import { ENABLE_SERVICE_BOOKING } from './config/features.js';

export function App() {
  const location = useLocation();
  const isPortalHome = location.pathname === '/';
  const theme = 'light';

  useEffect(() => {
    document.documentElement.dataset['theme'] = 'light';
    localStorage.setItem('marketing-theme', 'light');
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        {!isPortalHome && <Header theme={theme} />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/book"
              element={ENABLE_SERVICE_BOOKING ? <Book /> : <Navigate to="/tires" replace />}
            />
            <Route path="/tires" element={<Tires />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        {!isPortalHome && <Footer theme={theme} />}
      </div>
      <ToastContainer />
    </ErrorBoundary>
  );
}

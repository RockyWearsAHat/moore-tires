import { Routes, Route } from 'react-router-dom';
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

export function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
          <Route path="/tires" element={<Tires />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

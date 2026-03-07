import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/ui/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';

// Info Pages
import AboutUs from './pages/info/AboutUs';
import Careers from './pages/info/Careers';
import Blog from './pages/info/Blog';
import Press from './pages/info/Press';
import HelpCenter from './pages/info/HelpCenter';
import Shipping from './pages/info/Shipping';
import Returns from './pages/info/Returns';
import SizeGuide from './pages/info/SizeGuide';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <CartDrawer />
      <main className={!isAuthPage ? 'pt-20' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />

          {/* Info Routes */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/press" element={<Press />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/size-guide" element={<SizeGuide />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <AppLayout />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

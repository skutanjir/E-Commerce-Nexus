import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { PopupProvider } from './contexts/PopupContext';
import About from './pages/info/About';
import PrivacyPolicy from './pages/info/PrivacyPolicy';
import TermsOfService from './pages/info/TermsOfService';
import ShippingInfo from './pages/info/ShippingInfo';
import HelpCenter from './pages/info/HelpCenter';
import TrackOrder from './pages/info/TrackOrder';
import ReturnPolicy from './pages/info/ReturnPolicy';
import FAQ from './pages/info/FAQ';
import AdminShell from './pages/admin/AdminShell';
import AdminLayout from './pages/admin/LayoutWrapper';
import AdminOverview from './pages/admin/Overview';
import OrdersAdmin from './pages/admin/Orders';
import ProductsAdmin from './pages/admin/Products';
import AnalyticsAdmin from './pages/admin/Analytics';
import DiscountsAdmin from './pages/admin/Discounts';
import CategoriesAdmin from './pages/admin/Categories';
import Categories from './pages/shop/Categories';
import CategoryProducts from './pages/shop/CategoryProducts';
import Checkout from './pages/shop/Checkout';
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import AuthCallback from './pages/auth/Callback';
import ProductDetail from './pages/shop/ProductDetail';
import Register from './pages/auth/Register';
import Cart from './pages/shop/Cart';
import Catalogue from './pages/shop/Catalogue';
import DashboardOverview from './pages/dashboard/Overview';
import Addresses from './pages/dashboard/Addresses';
import Orders from './pages/dashboard/Orders';
import OrderDetail from './pages/dashboard/OrderDetail';
import ChatPage from './pages/dashboard/Chat';
import SellerChatPage from './pages/admin/Chat';
import Profile from './pages/dashboard/Profile';
import Wishlist from './pages/dashboard/Wishlist';
import SellerDetail from './pages/shop/SellerDetail';

export default function App() {
  return (
    <PopupProvider>
      <UserProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/kebijakan-privasi" element={<PrivacyPolicy />} />
        <Route path="/syarat-layanan" element={<TermsOfService />} />
        <Route path="/info-pengiriman" element={<ShippingInfo />} />
        <Route path="/pusat-bantuan" element={<HelpCenter />} />
        <Route path="/lacak-pesanan" element={<TrackOrder />} />
        <Route path="/kebijakan-retur" element={<ReturnPolicy />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Admin routes — shared shell, sidebar stays mounted on nav */}
        <Route element={<AdminShell />}>
          <Route path="/admin-dashboard-overview" element={<AdminOverview />} />
          <Route path="/admin-order-management" element={<OrdersAdmin />} />
          <Route path="/admin-product-management" element={<ProductsAdmin />} />
          <Route path="/admin-category-management" element={<CategoriesAdmin />} />
          <Route path="/admin-reports-analytics" element={<AnalyticsAdmin />} />
          <Route path="/admin-discounts" element={<DiscountsAdmin />} />
          <Route path="/admin-dashboard-chat" element={<SellerChatPage />} />
          <Route path="/admin-dashboard-chat/:contactId" element={<SellerChatPage />} />
        </Route>

        <Route path="/admin-dashboard-fixed-layout" element={<AdminLayout />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryProducts />} />
        <Route path="/categories-page" element={<Categories />} />
        <Route path="/checkout-flow" element={<Checkout />} />
        <Route path="/landing-page" element={<Home />} />
        <Route path="/login-page" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/seller/:id" element={<SellerDetail />} />
        <Route path="/register-page" element={<Register />} />
        <Route path="/shopping-cart" element={<Cart />} />
        <Route path="/shop-catalogue" element={<Catalogue />} />
        <Route path="/user-dashboard" element={<DashboardOverview />} />
        <Route path="/user-dashboard-addresses" element={<Addresses />} />
        <Route path="/user-dashboard-orders" element={<Orders />} />
        <Route path="/user-dashboard-orders/:id" element={<OrderDetail />} />
        <Route path="/user-dashboard-chat" element={<ChatPage />} />
        <Route path="/user-dashboard-chat/:contactId" element={<ChatPage />} />
        <Route path="/user-dashboard-profile" element={<Profile />} />
        <Route path="/user-dashboard-wishlist" element={<Wishlist />} />
      </Routes>
      </BrowserRouter>
      </UserProvider>
    </PopupProvider>
  );
}

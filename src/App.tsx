import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from './pages/info/About';
import CategoriesAdmin from './pages/admin/Categories';
import AdminLayout from './pages/admin/LayoutWrapper';
import AdminOverview from './pages/admin/Overview';
import OrdersAdmin from './pages/admin/Orders';
import ProductsAdmin from './pages/admin/Products';
import AnalyticsAdmin from './pages/admin/Analytics';
import DiscountsAdmin from './pages/admin/Discounts';
import Categories from './pages/shop/Categories';
import CategoryProducts from './pages/shop/CategoryProducts';
import Checkout from './pages/shop/Checkout';
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import ProductDetail from './pages/shop/ProductDetail';
import Register from './pages/auth/Register';
import Cart from './pages/shop/Cart';
import Catalogue from './pages/shop/Catalogue';
import DashboardOverview from './pages/dashboard/Overview';
import Addresses from './pages/dashboard/Addresses';
import Orders from './pages/dashboard/Orders';
import Profile from './pages/dashboard/Profile';
import Wishlist from './pages/dashboard/Wishlist';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/admin-category-management" element={<CategoriesAdmin />} />
        <Route path="/admin-dashboard-fixed-layout" element={<AdminLayout />} />
        <Route path="/admin-dashboard-overview" element={<AdminOverview />} />
        <Route path="/admin-order-management" element={<OrdersAdmin />} />
        <Route path="/admin-product-management" element={<ProductsAdmin />} />
        <Route path="/admin-reports-analytics" element={<AnalyticsAdmin />} />
        <Route path="/admin-discounts" element={<DiscountsAdmin />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:slug" element={<CategoryProducts />} />
        <Route path="/categories-page" element={<Categories />} />
        <Route path="/checkout-flow" element={<Checkout />} />
        <Route path="/landing-page" element={<Home />} />
        <Route path="/login-page" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/register-page" element={<Register />} />
        <Route path="/shopping-cart" element={<Cart />} />
        <Route path="/shop-catalogue" element={<Catalogue />} />
        <Route path="/user-dashboard" element={<DashboardOverview />} />
        <Route path="/user-dashboard-addresses" element={<Addresses />} />
        <Route path="/user-dashboard-orders" element={<Orders />} />
        <Route path="/user-dashboard-profile" element={<Profile />} />
        <Route path="/user-dashboard-wishlist" element={<Wishlist />} />
      </Routes>
    </BrowserRouter>
  );
}

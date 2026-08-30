import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import TrackOrderPage from './pages/TrackOrderPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardStats from './components/admin/DashboardStats';
import OrderManager from './components/admin/OrderManager';
import BannerManager from './components/admin/BannerManager';
import ProductManager from './components/admin/ProductManager';
import CategoryManager from './components/admin/CategoryManager';
import SettingsManager from './components/admin/SettingsManager';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            {/* Customer Public Storefront Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:category" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/login" element={<CustomerLoginPage />} />
            <Route path="/account" element={<CustomerLoginPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
            <Route path="/shipping-returns" element={<TermsPage />} />

            {/* Dedicated Admin Portal Routes (Direct URL Only: /admin/login) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />}>
              <Route index element={<DashboardStats />} />
              <Route path="dashboard" element={<DashboardStats />} />
              <Route path="orders" element={<OrderManager />} />
              <Route path="banners" element={<BannerManager />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;

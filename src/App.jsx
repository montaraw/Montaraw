import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';

// Instant Primary Home Page (No lazy delay on critical path)
import HomePage from './pages/HomePage';

// Lazy-Loaded Customer Pages (Split into on-demand chunks)
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const CustomerLoginPage = lazy(() => import('./pages/CustomerLoginPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

// Lazy-Loaded Admin Portal (Completely separated from customer bundle)
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const DashboardStats = lazy(() => import('./components/admin/DashboardStats'));
const OrderManager = lazy(() => import('./components/admin/OrderManager'));
const BannerManager = lazy(() => import('./components/admin/BannerManager'));
const ProductManager = lazy(() => import('./components/admin/ProductManager'));
const CategoryManager = lazy(() => import('./components/admin/CategoryManager'));
const SettingsManager = lazy(() => import('./components/admin/SettingsManager'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
  </div>
);

function App() {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<PageLoader />}>
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

              {/* Dedicated Admin Portal Routes */}
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
          </Suspense>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;

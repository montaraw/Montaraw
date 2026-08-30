import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { Menu, LogOut, ExternalLink, ShieldCheck, Truck } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useAdmin } from '../context/AdminContext';
import { useOrders } from '../context/OrderContext';
import MontarawLogo from '../components/ui/MontarawLogo';

export default function AdminDashboardPage() {
  const { isAdminLoggedIn, adminLogout } = useAdmin();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'Processing').length;

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
    }
  }, [isAdminLoggedIn, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (!isAdminLoggedIn) return null;

  const getPageTitle = () => {
    const segment = location.pathname.split('/').filter(Boolean).pop();
    if (!segment || segment === 'admin' || segment === 'dashboard') return 'DASHBOARD';
    return segment.replace(/-/g, ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-brand-black font-inter text-white">
      {/* Sidebar & Mobile Drawer */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky Clean Admin Header for Mobile & Desktop */}
        <header className="sticky top-0 z-30 bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/15 px-4 md:px-8 py-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            {/* Left: Mobile Menu Trigger & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#181818] border border-white/20 text-white hover:bg-white/10 transition-colors shadow-md"
                aria-label="Open navigation menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <h1 className="text-sm md:text-base font-black text-white uppercase tracking-normal">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            {/* Right: Quick Actions & Store Return */}
            <div className="flex items-center gap-2.5 md:gap-4">
              {/* Pending Orders Pill */}
              {pendingOrders > 0 && (
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-red/20 border border-brand-red/40 text-brand-red text-xs font-bold uppercase transition-all hover:bg-brand-red/30"
                  title={`${pendingOrders} Processing Orders`}
                >
                  <Truck size={14} />
                  <span className="hidden sm:inline">Orders:</span>
                  <span className="bg-brand-red text-white px-1.5 py-0.2 rounded-full text-[10px]">
                    {pendingOrders}
                  </span>
                </Link>
              )}

              {/* View Live Store */}
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/20 hover:border-white text-gray-200 hover:text-white text-xs font-bold uppercase transition-all bg-white/5"
                title="Open Public Storefront"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">View Store</span>
              </Link>

              {/* Admin Profile & Logout on desktop */}
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/15 text-xs">
                <div className="text-right">
                  <span className="text-white font-bold block">Administrator</span>
                  <span className="text-gray-400 text-[10px]">adminmontaraw@gmail.com</span>
                </div>
                <button
                  onClick={adminLogout}
                  className="p-2 rounded-xl bg-white/5 hover:bg-brand-red/20 hover:text-red-400 text-gray-300 border border-white/15 transition-all"
                  title="Log Out Admin"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content View */}
        <main className="p-4 sm:p-6 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

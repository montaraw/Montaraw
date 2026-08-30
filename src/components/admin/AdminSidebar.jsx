import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Package,
  FolderOpen,
  Image,
  Settings,
  LogOut,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useOrders } from '../../context/OrderContext';
import MontarawLogo from '../ui/MontarawLogo';

export default function AdminSidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const { adminLogout } = useAdmin();
  const { orders } = useOrders();

  const pendingOrders = orders.filter((o) => o.status === 'Processing').length;

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Orders', icon: Truck, path: '/admin/orders', badge: pendingOrders > 0 ? pendingOrders : null },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Categories', icon: FolderOpen, path: '/admin/categories' },
    { label: 'Banners', icon: Image, path: '/admin/banners' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-72 lg:w-64 bg-[#0d0d0d] border-r border-white/15 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 font-inter text-white shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-white/15 bg-black/40">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <MontarawLogo iconSize="w-8 h-8" textSize="text-lg" />
            </Link>
            <button
              onClick={onToggle}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Section Tag */}
          <div className="px-5 pt-4 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red block">
              Admin Portal
            </span>
          </div>

          {/* Nav Menu */}
          <nav className="py-2 px-3 space-y-1.5">
            {menuItems.map(({ label, icon: Icon, path, badge }) => {
              const active =
                location.pathname === path ||
                (path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/'));
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all duration-200 ${
                    active
                      ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/15 bg-black/60 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-gray-200 hover:text-white hover:bg-white/10 border border-white/15 transition-all"
          >
            <span className="flex items-center gap-2">
              <ChevronLeft size={16} />
              <span>Customer Store</span>
            </span>
            <ExternalLink size={14} className="text-gray-400" />
          </Link>

          <button
            onClick={adminLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-red-400 hover:text-white hover:bg-brand-red/20 border border-red-500/30 transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}

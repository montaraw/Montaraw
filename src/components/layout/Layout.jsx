import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

export default function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLegalPage =
    location.pathname.startsWith('/privacy') ||
    location.pathname.startsWith('/terms') ||
    location.pathname.startsWith('/shipping-returns');

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-black text-white font-inter">
      {/* Top Announcement Bar (scrolls away naturally) */}
      <AnnouncementBar />

      {/* Sticky Header with Navbar pinned at top-0 */}
      <header className="sticky top-0 left-0 right-0 z-50">
        <Navbar isScrolled={isScrolled} />
      </header>
      <main className="flex-1">{children}</main>
      {!isLegalPage && <Footer />}
      <MobileBottomNav />
    </div>
  );
}

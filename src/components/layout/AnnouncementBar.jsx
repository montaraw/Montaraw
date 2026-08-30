import { useEffect, useState } from 'react';

const messages = [
  'FREE SHIPPING ON ALL ORDERS ABOVE ₹999',
  'EASY RETURNS WITHIN 7 DAYS',
  'COD AVAILABLE ACROSS INDIA',
  'PREMIUM QUALITY GUARANTEED',
];

export default function AnnouncementBar({ isScrolled = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`bg-brand-red text-white text-center px-4 relative z-50 overflow-hidden transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'max-h-0 py-0 opacity-0 -translate-y-full pointer-events-none'
          : 'max-h-12 py-2 opacity-100 translate-y-0'
      }`}
    >
      <p
        className={`text-[11px] md:text-xs font-inter uppercase transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        {messages[currentIndex]}
      </p>
    </div>
  );
}

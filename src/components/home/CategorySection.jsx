import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export default function CategorySection() {
  const { categories, loading } = useProducts();

  if (loading || !categories || categories.length === 0) {
    return (
      <section className="py-12 md:py-16 bg-brand-black font-inter text-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          {/* Skeleton Header */}
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-brand-red text-xs font-bold uppercase tracking-wider">
                  CURATED ATELIER
                </span>
                <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">
                  • Curating Collections...
                </span>
              </div>
              <div className="h-7 md:h-9 w-52 md:w-72 bg-white/10 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Mobile Skeleton: Circle Row */}
          <div className="flex md:hidden items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex flex-col items-center shrink-0 w-20 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-[#181818] border border-white/10" />
                <div className="w-12 h-2.5 bg-white/10 rounded mt-2" />
              </div>
            ))}
          </div>

          {/* Desktop Skeleton: 5 Grid Cards */}
          <div className="hidden md:grid grid-cols-5 gap-4 lg:gap-5">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="aspect-[3/4] rounded-2xl bg-[#141414] border border-white/10 p-4 flex flex-col justify-between animate-pulse relative overflow-hidden"
              >
                <div className="w-16 h-5 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-white/15 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-brand-black font-inter text-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <span className="text-brand-red text-xs font-bold uppercase block mb-1">
              CURATED ATELIER
            </span>
            <h2 className="text-xl md:text-3xl font-black text-white uppercase">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-red-400 transition-colors uppercase group"
          >
            <span>VIEW ALL</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile View: Circular Avatar Bubble Row */}
        <div className="flex md:hidden items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => (
            <Link key={cat.id || cat.slug} to={`/shop/${cat.slug}`} className="flex flex-col items-center shrink-0 w-20">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 p-0.5 bg-[#181818] shadow-md hover:border-brand-red transition-all">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-xs font-bold text-white mt-2 text-center line-clamp-1 uppercase">
                {cat.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>

        {/* Desktop View: Grid of Luxury Category Cards */}
        <div className="hidden md:grid grid-cols-5 gap-4 lg:gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id || cat.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/shop/${cat.slug}`}
                className="group block aspect-[3/4] relative rounded-2xl overflow-hidden bg-[#141414] border border-white/15 hover:border-white/40 transition-all duration-500 shadow-xl"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-colors" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/25 text-[10px] font-bold text-white uppercase">
                    {cat.gender || 'Collection'}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-base font-bold text-white uppercase leading-tight group-hover:text-brand-red transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

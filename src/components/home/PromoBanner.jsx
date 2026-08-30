import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PromoBanner() {
  return (
    <section className="hidden md:block py-8 md:py-12 bg-brand-black font-inter">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-black border border-white/10 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[260px]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&q=85"
              alt="Montaraw Drop"
              className="w-full h-full object-cover object-right sm:object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>

          {/* Left Content */}
          <div className="relative z-10 flex items-center gap-6 md:gap-8 max-w-xl">
            {/* Brand Logo */}
            <div className="shrink-0 hidden sm:block">
              <img
                src="/logo.png"
                alt="MONTARAW"
                className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-2xl border border-white/10"
              />
            </div>

            <div>
              <span className="text-brand-red text-xs font-bold uppercase mb-1.5 block">
                LIMITED DROP
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                NOT FOR EVERYONE.
              </h2>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-5">
                MADE FOR THE FEW.
              </h2>
              <Link
                to="/shop"
                className="bg-white text-black font-bold text-xs uppercase px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors inline-block shadow-lg"
              >
                DISCOVER NOW
              </Link>
            </div>
          </div>

          {/* Right Image Overlay Element */}
          <div className="relative z-10 hidden lg:block pr-8">
            <span className="text-7xl font-black text-white/5 uppercase select-none">
              MONTARAW
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

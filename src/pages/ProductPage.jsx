import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ImageGallery from '../components/product/ImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../context/ProductContext';

export default function ProductPage() {
  const { id } = useParams();
  const { getProductById, products, loading } = useProducts();
  const product = getProductById(id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (loading && !product) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-[#0a0a0a] font-inter">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 tracking-widest uppercase font-semibold">Loading Atelier Garment...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-[#0a0a0a] font-inter px-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase">Garment Not Found</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            The piece you are looking for might have been moved or is currently in production.
          </p>
          <Link to="/shop" className="btn-primary rounded-xl py-3.5 px-8 text-xs uppercase font-bold inline-block shadow-xl">
            Explore All Collections
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pt-8 md:pt-12 pb-20 min-h-screen bg-brand-black font-inter">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/50 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?gender=${product.gender}`} className="hover:text-white transition-colors capitalize">{product.gender}</Link>
          <ChevronRight size={12} />
          <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ImageGallery images={product.images || [product.image]} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ProductInfo product={product} />
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase mb-6">
              YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

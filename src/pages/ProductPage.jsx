import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ImageGallery from '../components/product/ImageGallery';
import ProductInfo from '../components/product/ProductInfo';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../context/ProductContext';

export default function ProductPage() {
  const { id } = useParams();
  const { getProductById, products } = useProducts();
  const product = getProductById(id);

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-brand-black font-inter">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-3">Product Not Found</h2>
          <Link to="/shop" className="btn-primary rounded-xl py-3 px-6 text-xs uppercase font-bold">
            Back to Shop
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

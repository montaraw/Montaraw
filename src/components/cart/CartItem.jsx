import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4 p-4 bg-[#121212] border border-white/15 rounded-2xl font-inter text-white">
      {/* Product Image */}
      <Link to={`/product/${item.id}`} className="shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-24 object-cover rounded-xl bg-black border border-white/15"
        />
      </Link>

      {/* Product Meta */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.id}`}
          className="font-bold text-xs sm:text-sm text-white hover:text-brand-red transition-colors line-clamp-1 block"
        >
          {item.name}
        </Link>

        <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
          <span>Size: <strong className="text-white">{item.selectedSize}</strong></span>
          {item.selectedColorName && (
            <span>Color: <strong className="text-white">{item.selectedColorName}</strong></span>
          )}
        </div>

        <p className="text-xs sm:text-sm font-black text-white mt-1.5">
          ₹{item.price.toLocaleString()}
        </p>
      </div>

      {/* Quantity & Delete Controls */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
        <div className="flex items-center bg-[#181818] border border-white/20 rounded-xl overflow-hidden">
          <button
            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
            className="p-2 text-white hover:bg-white/10 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span className="px-2.5 text-xs font-black text-white min-w-[20px] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
            className="p-2 text-white hover:bg-white/10 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>

        <button
          onClick={() => removeFromCart(item.cartItemId)}
          className="p-2 text-gray-400 hover:text-brand-red transition-colors"
          title="Remove Item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

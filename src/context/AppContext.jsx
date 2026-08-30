import { ProductProvider } from './ProductContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { AdminProvider } from './AdminContext';
import { OrderProvider } from './OrderContext';
import { AuthProvider } from './AuthContext';

export function AppProvider({ children }) {
  return (
    <ProductProvider>
      <CartProvider>
        <WishlistProvider>
          <OrderProvider>
            <AuthProvider>
              <AdminProvider>
                {children}
              </AdminProvider>
            </AuthProvider>
          </OrderProvider>
        </WishlistProvider>
      </CartProvider>
    </ProductProvider>
  );
}

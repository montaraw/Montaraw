import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { api } from '../api/client';
import { defaultSettings, defaultBanners, defaultCategories, defaultProducts } from '../data/seedData';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(defaultProducts);
  const [categories, setCategories] = useState(defaultCategories);
  const [banners, setBanners] = useState(defaultBanners);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Fetch 100% Live Data from Backend API
  const fetchBackendData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, banRes, setRes] = await Promise.allSettled([
        api.getProducts(),
        api.getCategories(),
        api.getBanners(),
        api.getSettings(),
      ]);

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value?.products)) {
        const cleanProds = prodRes.value.products.filter(
          (p) => !['dresses', 'oversized-tshirts', 'hoodies', 'bottoms', 'co-ords', 'dresses-gowns'].includes(p.categorySlug || p.category?.slug)
        );
        setProducts(cleanProds);
      }
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value?.categories)) {
        const cleanCats = catRes.value.categories.filter(
          (c) => !['dresses', 'oversized-tshirts', 'hoodies', 'bottoms', 'co-ords', 'dresses-gowns'].includes(c.slug)
        );
        setCategories(cleanCats);
      }
      if (banRes.status === 'fulfilled' && Array.isArray(banRes.value?.banners)) {
        setBanners(banRes.value.banners);
      }
      if (setRes.status === 'fulfilled' && setRes.value?.settings) {
        setSettings(setRes.value.settings);
      }
    } catch (err) {
      console.error('[ProductContext] Failed to fetch data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // Product CRUD via Backend API
  const addProduct = useCallback(async (productData) => {
    try {
      const res = await api.createProduct(productData);
      const newProduct = res?.product || { ...productData, id: `prod-${Date.now()}` };
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (e) {
      console.warn('[ProductContext] API createProduct notice:', e.message);
      const localProd = { ...productData, id: `prod-${Date.now()}` };
      setProducts((prev) => [localProd, ...prev]);
      return localProd;
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      const res = await api.updateProduct(id, updates);
      const updatedProduct = res?.product || { ...updates, id };
      setProducts((prev) =>
        prev.map((p) => (p.id === id || p.slug === id ? { ...p, ...updatedProduct } : p))
      );
      return updatedProduct;
    } catch (e) {
      console.warn('[ProductContext] API updateProduct notice:', e.message);
      setProducts((prev) =>
        prev.map((p) => (p.id === id || p.slug === id ? { ...p, ...updates } : p))
      );
      return { ...updates, id };
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.deleteProduct(id);
    } catch (e) {
      console.warn('[ProductContext] API deleteProduct notice:', e.message);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
  }, []);

  // Category CRUD via Backend API
  const addCategory = useCallback(async (categoryData) => {
    try {
      const res = await api.createCategory(categoryData);
      if (res.category) {
        setCategories((prev) => [...prev, res.category]);
        return res.category;
      }
    } catch (e) {
      console.error('[ProductContext] API createCategory failed:', e);
      throw e;
    }
  }, []);

  const updateCategory = useCallback(async (id, updates) => {
    try {
      const res = await api.updateCategory(id, updates);
      if (res.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? res.category : c))
        );
      }
    } catch (e) {
      console.error('[ProductContext] API updateCategory failed:', e);
      throw e;
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error('[ProductContext] API deleteCategory failed:', e);
      throw e;
    }
  }, []);

  // Banner CRUD via Backend API
  const addBanner = useCallback(async (bannerData) => {
    try {
      const res = await api.createBanner(bannerData);
      if (res.banner) {
        setBanners((prev) => [...prev, res.banner]);
        return res.banner;
      }
    } catch (e) {
      console.error('[ProductContext] API createBanner failed:', e);
      throw e;
    }
  }, []);

  const updateBanner = useCallback(async (id, updates) => {
    try {
      const res = await api.updateBanner(id, updates);
      if (res.banner) {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? res.banner : b))
        );
      }
    } catch (e) {
      console.error('[ProductContext] API updateBanner failed:', e);
      throw e;
    }
  }, []);

  const deleteBanner = useCallback(async (id) => {
    try {
      await api.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error('[ProductContext] API deleteBanner failed:', e);
      throw e;
    }
  }, []);

  // Store Settings via Backend API
  const updateSettings = useCallback(async (updates) => {
    try {
      const res = await api.updateSettings(updates);
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (e) {
      console.error('[ProductContext] API updateSettings failed:', e);
      throw e;
    }
  }, []);

  // Product Finder by ID or Slug (Case-Insensitive)
  const getProductById = useCallback(
    (idOrSlug) => {
      if (!idOrSlug) return null;
      const cleanTarget = String(idOrSlug).toLowerCase().trim();
      return (
        products.find(
          (p) =>
            String(p.id).toLowerCase() === cleanTarget ||
            (p.slug && String(p.slug).toLowerCase() === cleanTarget)
        ) || null
      );
    },
    [products]
  );

  // Robust filtering
  const filterProducts = useCallback(
    ({
      gender = 'all',
      category = 'all',
      isSale = false,
      isNew = false,
      sizes = [],
      colors = [],
      minPrice = 0,
      maxPrice = 100000,
      sortBy = 'latest',
      search = '',
    }) => {
      let filtered = [...products];

      // 1. Search Query
      if (search) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.categorySlug?.toLowerCase().includes(q) ||
            p.category?.name?.toLowerCase().includes(q) ||
            (typeof p.category === 'string' && p.category.toLowerCase().includes(q)) ||
            p.description?.toLowerCase().includes(q) ||
            p.gender?.toLowerCase().includes(q) ||
            p.fabric?.toLowerCase().includes(q)
        );
      }

      // 2. Gender Filter (Strict Isolation: Women contains only women items, Men contains only men items)
      if (gender && gender !== 'all') {
        const g = gender.toLowerCase();
        filtered = filtered.filter((p) => {
          const prodGender = (p.gender || '').toLowerCase();
          if (g === 'women') {
            return prodGender === 'women';
          }
          if (g === 'men') {
            return prodGender === 'men';
          }
          return prodGender === g;
        });
      }

      // 3. Category Filter
      if (category && category !== 'all') {
        const catSlug = category.toLowerCase();
        if (catSlug === 'men') {
          filtered = filtered.filter((p) => (p.gender || '').toLowerCase() === 'men');
        } else if (catSlug === 'women') {
          filtered = filtered.filter((p) => (p.gender || '').toLowerCase() === 'women');
        } else if (catSlug === 'sale') {
          filtered = filtered.filter((p) => p.isSale || (p.originalPrice && p.originalPrice > p.price));
        } else if (catSlug === 'new-arrivals') {
          filtered = filtered.filter((p) => p.isNew);
        } else {
          filtered = filtered.filter((p) => {
            const pCat = (p.categorySlug || p.category?.slug || (typeof p.category === 'string' ? p.category : '')).toLowerCase();
            return pCat === catSlug;
          });
        }
      }

      // 4. Sale Filter
      if (isSale) {
        filtered = filtered.filter((p) => p.isSale || (p.originalPrice && p.originalPrice > p.price));
      }

      // 5. New Arrival Filter
      if (isNew) {
        filtered = filtered.filter((p) => p.isNew);
      }

      // 6. Sizes Filter
      if (sizes && sizes.length > 0) {
        filtered = filtered.filter((p) =>
          p.sizes && p.sizes.some((s) => sizes.includes(s))
        );
      }

      // 7. Colors Filter
      if (colors && colors.length > 0) {
        filtered = filtered.filter((p) =>
          p.colors && p.colors.some((c) => colors.includes(c))
        );
      }

      // 8. Price Range
      if (minPrice !== undefined && minPrice > 0) {
        filtered = filtered.filter((p) => p.price >= minPrice);
      }
      if (maxPrice !== undefined && maxPrice > 0) {
        filtered = filtered.filter((p) => p.price <= maxPrice);
      }

      // 9. Sort By
      if (sortBy) {
        switch (sortBy) {
          case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
            break;
          case 'rating':
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case 'discount':
            filtered.sort((a, b) => {
              const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
              const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
              return discB - discA;
            });
            break;
          case 'latest':
          default:
            filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
        }
      }

      return filtered;
    },
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      categories,
      banners,
      settings,
      loading,
      refreshData: fetchBackendData,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      filterProducts,
      addCategory,
      updateCategory,
      deleteCategory,
      addBanner,
      updateBanner,
      deleteBanner,
      updateSettings,
    }),
    [
      products,
      categories,
      banners,
      settings,
      loading,
      fetchBackendData,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      filterProducts,
      addCategory,
      updateCategory,
      deleteCategory,
      addBanner,
      updateBanner,
      deleteBanner,
      updateSettings,
    ]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
}

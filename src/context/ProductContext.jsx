import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { api } from '../api/client';
import { defaultSettings, defaultBanners, defaultCategories, defaultProducts } from '../data/seedData';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  // 1. INSTANT HYDRATION: Pre-populated with rich seed catalog (0ms latency, zero blank screen)
  const [products, setProducts] = useState(defaultProducts);
  const [categories, setCategories] = useState(defaultCategories);
  const [banners, setBanners] = useState(defaultBanners);
  const [settings, setSettings] = useState(defaultSettings || {
    brandName: 'MONTARAW',
    tagline: 'Luxury Pakistani Suits & Contemporary Couture',
    contactEmail: 'montarawsupport@gmail.com',
    contactPhone: '+91 97205 38576',
    contactPhoneSecondary: '+91 62064 24372',
    instagram: 'https://www.instagram.com/montarawsupport?igsi=MjJ2NWdrMGRtYzM1',
    facebook: 'https://www.facebook.com/share/17Vh8emhBD/',
  });
  // loading is false by default so UI renders instantly!
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 2. Background Stale-While-Revalidate (SWR) Sync via unified /api/homepage
  const syncBackendData = useCallback(async () => {
    try {
      setIsSyncing(true);
      
      // Try consolidated single endpoint first
      try {
        const homeData = await api.getHomepage();
        if (homeData?.success) {
          if (Array.isArray(homeData.banners) && homeData.banners.length > 0) {
            setBanners(homeData.banners);
          }
          if (Array.isArray(homeData.categories) && homeData.categories.length > 0) {
            setCategories(homeData.categories);
          }
          if (homeData.settings) {
            setSettings(homeData.settings);
          }
        }
      } catch {
        // Fallback to direct products call if homepage route not deployed yet
      }

      // Sync full product catalog in background
      const prodRes = await api.getProducts();
      if (prodRes?.products && Array.isArray(prodRes.products) && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      }
    } catch (err) {
      console.warn('[ProductContext] Live sync notice: Running on offline/edge seed data.', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncBackendData();
  }, [syncBackendData]);

  // Product CRUD via Backend API with Optimistic Updates
  const addProduct = useCallback(async (productData) => {
    const localProd = { ...productData, id: productData.id || `prod-${Date.now()}` };
    setProducts((prev) => [localProd, ...prev]);

    try {
      const res = await api.createProduct(productData);
      if (res?.product) {
        setProducts((prev) => prev.map((p) => (p.id === localProd.id ? res.product : p)));
        return res.product;
      }
      return localProd;
    } catch (e) {
      console.warn('[ProductContext] API createProduct notice:', e.message);
      return localProd;
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id || p.slug === id ? { ...p, ...updates } : p))
    );

    try {
      const res = await api.updateProduct(id, updates);
      if (res?.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id || p.slug === id ? { ...p, ...res.product } : p))
        );
        return res.product;
      }
      return { ...updates, id };
    } catch (e) {
      console.warn('[ProductContext] API updateProduct notice:', e.message);
      return { ...updates, id };
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
    try {
      await api.deleteProduct(id);
    } catch (e) {
      console.warn('[ProductContext] API deleteProduct notice:', e.message);
    }
  }, []);

  // Category CRUD
  const addCategory = useCallback(async (categoryData) => {
    const localCat = { ...categoryData, id: categoryData.id || `cat-${Date.now()}` };
    setCategories((prev) => [...prev, localCat]);
    try {
      const res = await api.createCategory(categoryData);
      if (res?.category) {
        setCategories((prev) => prev.map((c) => (c.id === localCat.id ? res.category : c)));
        return res.category;
      }
      return localCat;
    } catch (e) {
      console.error('[ProductContext] API createCategory notice:', e.message);
      return localCat;
    }
  }, []);

  const updateCategory = useCallback(async (id, updates) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    try {
      const res = await api.updateCategory(id, updates);
      if (res?.category) {
        setCategories((prev) => prev.map((c) => (c.id === id ? res.category : c)));
      }
    } catch (e) {
      console.error('[ProductContext] API updateCategory notice:', e.message);
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.deleteCategory(id);
    } catch (e) {
      console.error('[ProductContext] API deleteCategory notice:', e.message);
    }
  }, []);

  // Banner CRUD
  const addBanner = useCallback(async (bannerData) => {
    const localBan = { ...bannerData, id: bannerData.id || `ban-${Date.now()}` };
    setBanners((prev) => [...prev, localBan]);
    try {
      const res = await api.createBanner(bannerData);
      if (res?.banner) {
        setBanners((prev) => prev.map((b) => (b.id === localBan.id ? res.banner : b)));
        return res.banner;
      }
      return localBan;
    } catch (e) {
      console.error('[ProductContext] API createBanner notice:', e.message);
      return localBan;
    }
  }, []);

  const updateBanner = useCallback(async (id, updates) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    try {
      const res = await api.updateBanner(id, updates);
      if (res?.banner) {
        setBanners((prev) => prev.map((b) => (b.id === id ? res.banner : b)));
        return res.banner;
      }
      return { id, ...updates };
    } catch (e) {
      console.error('[ProductContext] API updateBanner notice:', e.message);
      return { id, ...updates };
    }
  }, []);

  const deleteBanner = useCallback(async (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await api.deleteBanner(id);
    } catch (e) {
      console.error('[ProductContext] API deleteBanner notice:', e.message);
    }
  }, []);

  // Store Settings
  const updateSettings = useCallback(async (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    try {
      const res = await api.updateSettings(updates);
      if (res?.settings) {
        setSettings(res.settings);
      }
    } catch (e) {
      console.error('[ProductContext] API updateSettings notice:', e.message);
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

  // High-performance filtering engine
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

      // 2. Gender Filter
      if (gender && gender !== 'all') {
        const g = gender.toLowerCase();
        filtered = filtered.filter((p) => {
          const prodGender = (p.gender || '').toLowerCase();
          if (g === 'women') return prodGender === 'women';
          if (g === 'men') return prodGender === 'men';
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
      isSyncing,
      refreshData: syncBackendData,
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
      isSyncing,
      syncBackendData,
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

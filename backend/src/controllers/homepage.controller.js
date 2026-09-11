import prisma from '../config/prisma.js';
import { cache } from '../services/cache.service.js';
import { defaultBanners, defaultCategories, defaultProducts, defaultSettings } from '../config/defaultData.js';

export const getHomepageData = async (req, res) => {
  const CACHE_KEY = 'montaraw:homepage:v1';

  try {
    const cachedData = cache.get(CACHE_KEY);
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      return res.json({ success: true, fromCache: true, ...cachedData });
    }

    // Attempt database query
    const [banners, categories, products, settings] = await Promise.all([
      prisma.banner.findMany({ orderBy: { order: 'asc' } }),
      prisma.category.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.product.findMany({
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      }),
      prisma.setting.findFirst(),
    ]);

    const payload = {
      banners: (banners && banners.length > 0) ? banners : defaultBanners,
      categories: (categories && categories.length > 0) ? categories : defaultCategories,
      products: (products && products.length > 0) ? products : defaultProducts,
      settings: settings || defaultSettings,
    };

    cache.set(CACHE_KEY, payload, 900);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return res.json({ success: true, fromCache: false, ...payload });
  } catch (error) {
    console.warn('⚠️ [Homepage API Notice - DB Unreachable, serving fallback catalog]:', error.message);

    const fallbackPayload = {
      banners: defaultBanners,
      categories: defaultCategories,
      products: defaultProducts,
      settings: defaultSettings,
    };

    // Cache fallback for 60s so server doesn't hammer a disconnected DB on every tick
    cache.set(CACHE_KEY, fallbackPayload, 60);

    return res.json({
      success: true,
      fromFallback: true,
      notice: 'Serving edge-resilient catalog. Check Supabase connection pooler.',
      ...fallbackPayload,
    });
  }
};

export const invalidateHomepageCache = () => {
  cache.del('montaraw:homepage:*');
};

import prisma from '../config/prisma.js';
import { isDatabaseAlive, setDatabaseOffline } from '../config/dbState.js';

const cleanCatalogData = [
  // 1. PAKISTANI SUITS
  {
    name: 'Royal Embroidered Velvet Pakistani Suit',
    slug: 'royal-embroidered-velvet-pakistani-suit',
    gender: 'women',
    categorySlug: 'pakistani-suits',
    price: 5499,
    originalPrice: 7999,
    description: 'Heavily embroidered micro-velvet kurta featuring intricate gold zari work, organza sleeve borders, matched with raw silk straight trousers and pure chiffon dupatta.',
    fabric: 'Premium Micro Velvet & Pure Chiffon Dupatta',
    fit: 'Graceful Straight Cut',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#3b1424', '#0d2b1d'],
    colorNames: ['Noir Black', 'Wine Maroon', 'Emerald Green'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 28,
  },
  {
    name: 'Lawn Floral Digital Print Pakistani Suit',
    slug: 'lawn-floral-digital-print-pakistani-suit',
    gender: 'women',
    categorySlug: 'pakistani-suits',
    price: 3899,
    originalPrice: 4999,
    description: 'Luxury digital print lawn suit with embroidered neckline patch, lace inserts, dyed cotton trousers, and a lightweight silk dupatta.',
    fabric: '100% Premium Lawn Cotton & Silk Dupatta',
    fit: 'Relaxed Tailored Fit',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#f5f5f5', '#2c3e50'],
    colorNames: ['Ivory Floral', 'Navy Slate'],
    isNew: true,
    isSale: true,
    rating: 4.8,
    reviews: 19,
  },
  {
    name: 'Heavy Zari Work Georgette Pakistani Sharara Suit',
    slug: 'heavy-zari-work-georgette-pakistani-sharara-suit',
    gender: 'women',
    categorySlug: 'pakistani-suits',
    price: 6299,
    originalPrice: 8499,
    description: 'Royal festive georgette 3-piece suit featuring handcrafted resham and zari embroidery, paired with a flared tiered sharara and sequinned dupatta.',
    fabric: 'Pure Georgette with Shantoon Silk Lining',
    fit: 'Flared Festive Fit',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#3b1424', '#000000'],
    colorNames: ['Wine Plum', 'Noir Black'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 34,
  },

  // 2. SUITS
  {
    name: 'Classic Handcrafted Anarkali Suit Set',
    slug: 'classic-handcrafted-anarkali-suit-set',
    gender: 'women',
    categorySlug: 'suits',
    price: 4499,
    originalPrice: 5999,
    description: 'Flowing floor-length flared Anarkali silhouette crafted from lightweight georgette, accented with gold thread borders and coordinating churidar pants.',
    fabric: 'Georgette with Soft Butter Crepe Lining',
    fit: 'Flared Anarkali Silhouette',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#3b1424', '#000000'],
    colorNames: ['Deep Crimson', 'Noir Black'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 32,
  },
  {
    name: 'Chanderi Silk Straight Kurta Pant Suit',
    slug: 'chanderi-silk-straight-kurta-pant-suit',
    gender: 'women',
    categorySlug: 'suits',
    price: 3299,
    originalPrice: 4299,
    description: 'Sophisticated Chanderi silk straight-cut suit with delicate thread work at yoke and hem, paired with tapered cigarette pants and organza dupatta.',
    fabric: 'Pure Chanderi Silk Blend',
    fit: 'Straight Tailored Fit',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#d4af37', '#000000'],
    colorNames: ['Royal Gold', 'Jet Black'],
    isNew: false,
    isSale: true,
    rating: 4.7,
    reviews: 15,
  },
  {
    name: 'Embroidered Velvet Straight Pant Suit',
    slug: 'embroidered-velvet-straight-pant-suit',
    gender: 'women',
    categorySlug: 'suits',
    price: 4999,
    originalPrice: 6599,
    description: 'Rich velvet kurta with gold tilla embroidery along neckline and sleeves, paired with tailored straight-fit trousers and a printed tissue organza dupatta.',
    fabric: '9000 Micro Velvet & Pure Organza Dupatta',
    fit: 'Tailored Straight Fit',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#000000', '#0d2b1d'],
    colorNames: ['Noir Black', 'Emerald Green'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 22,
  },

  // 3. CORD SET
  {
    name: 'Luxury Velvet Pleated Cord Set',
    slug: 'luxury-velvet-pleated-cord-set',
    gender: 'women',
    categorySlug: 'cord-set',
    price: 3699,
    originalPrice: 4999,
    description: 'Modern luxury cord set featuring a button-down tunic shirt with dropped shoulders and matching wide-leg trousers in rich ribbed velvet.',
    fabric: 'Premium Stretch Velvet Cord (320 GSM)',
    fit: 'Relaxed Wide-Leg Lounge Fit',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#000000', '#3b1424', '#2d3328'],
    colorNames: ['Noir Black', 'Wine Plum', 'Forest Olive'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 21,
  },
  {
    name: 'Pure Cotton Ribbed Casual Cord Set',
    slug: 'pure-cotton-ribbed-casual-cord-set',
    gender: 'women',
    categorySlug: 'cord-set',
    price: 2799,
    originalPrice: 3599,
    description: 'Minimalist 2-piece oversized shirt and high-waisted shorts/trouser cord set crafted for everyday statement comfort and streetwear elevation.',
    fabric: '100% Breathable Combed Rib Cotton (280 GSM)',
    fit: 'Oversized Boxy Fit',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#8a7968', '#000000', '#f5f5f5'],
    colorNames: ['Mocha Taupe', 'Noir Black', 'Off White'],
    isNew: true,
    isSale: true,
    rating: 4.8,
    reviews: 17,
  },
  {
    name: 'Atelier Satin Blazer & Wide-Leg Cord Set',
    slug: 'atelier-satin-blazer-wide-leg-cord-set',
    gender: 'women',
    categorySlug: 'cord-set',
    price: 4299,
    originalPrice: 5699,
    description: 'Structured single-button drape blazer paired with coordinating high-waisted floor-sweeping pleated palazzo pants in fluid heavy satin weave.',
    fabric: 'Fluid Heavy Satin (260 GSM)',
    fit: 'Relaxed Tailored Fit',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#000000', '#f5f5f5'],
    colorNames: ['Noir Black', 'Champagne Ivory'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 29,
  },

  // 4. MEN STREETWEAR
  {
    name: '240 GSM Heavy Drop Shoulder Tee',
    slug: '240-gsm-heavy-drop-shoulder-tee',
    gender: 'men',
    categorySlug: 'men-streetwear',
    price: 1499,
    originalPrice: 1999,
    description: 'Our iconic signature 240 GSM drop shoulder tee. Built from 100% bio-washed combed cotton with dense 1.25-inch thick ribbed neck collar that never loses shape.',
    fabric: '100% Combed Compact Cotton (240 GSM)',
    fit: 'True Oversized Drop Shoulder',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#f5f5f5', '#2d3328'],
    colorNames: ['Noir Black', 'Off White', 'Washed Olive'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 58,
  },
  {
    name: '380 GSM Heavyweight Street Hoodie',
    slug: '380-gsm-heavyweight-street-hoodie',
    gender: 'men',
    categorySlug: 'men-streetwear',
    price: 2999,
    originalPrice: 3999,
    description: 'Engineered for chilly street nights. 380 GSM brushed fleece with double-lined structural hood, deep kangaroo pocket, and heavy ribbed cuff trims.',
    fabric: '100% Heavy Brushed Fleece Cotton (380 GSM)',
    fit: 'Relaxed Streetwear Fit',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#2d2d2d', '#8a7968'],
    colorNames: ['Noir Black', 'Dark Charcoal', 'Vintage Mocha'],
    isNew: true,
    isSale: false,
    rating: 4.9,
    reviews: 42,
  },
];

export const getProducts = async (req, res, next) => {
  const getFilteredCatalog = () => {
    let filtered = [...cleanCatalogData];
    if (req.query.gender && req.query.gender !== 'all') {
      filtered = filtered.filter((p) => p.gender === req.query.gender.toLowerCase());
    }
    if (req.query.category && req.query.category !== 'all') {
      filtered = filtered.filter((p) => p.categorySlug === req.query.category.toLowerCase());
    }
    return filtered;
  };

  // Instant zero-lag cache if DB is offline or pausing
  if (!(await isDatabaseAlive())) {
    const cached = getFilteredCatalog();
    return res.json({ success: true, count: cached.length, products: cached });
  }

  try {
    const { gender, category, isSale, isNew, minPrice, maxPrice, search, sort } = req.query;

    // 1. Check if database contains old dummy products (e.g. 'dresses', 'oversized-tshirts', 'hoodies', 'bottoms')
    const obsoleteSlugs = ['dresses', 'oversized-tshirts', 'hoodies', 'bottoms', 'co-ords', 'dresses-gowns'];
    const hasObsolete = await prisma.product.findFirst({
      where: {
        categorySlug: { in: obsoleteSlugs },
      },
    });

    if (hasObsolete) {
      await prisma.product.deleteMany({
        where: {
          categorySlug: { in: obsoleteSlugs },
        },
      });

      // Upsert fresh clean catalog items
      for (const prod of cleanCatalogData) {
        await prisma.product.upsert({
          where: { slug: prod.slug },
          update: prod,
          create: prod,
        });
      }
    }

    const where = {};

    if (gender && gender !== 'all') {
      where.gender = gender.toLowerCase();
    }

    if (category && category !== 'all') {
      where.categorySlug = category.toLowerCase();
    }

    if (isSale === 'true') {
      where.isSale = true;
    }

    if (isNew === 'true') {
      where.isNew = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { categorySlug: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-low') orderBy = { price: 'asc' };
    if (sort === 'price-high') orderBy = { price: 'desc' };
    if (sort === 'popular') orderBy = { reviews: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    setDatabaseOffline();
    const fallback = getFilteredCatalog();
    return res.json({
      success: true,
      count: fallback.length,
      products: fallback,
    });
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Garment not found.' });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      gender,
      categorySlug,
      category,
      price,
      originalPrice,
      description,
      fabric,
      fit,
      image,
      images,
      sizes,
      colors,
      colorNames,
      isNew,
      isSale,
      stock,
    } = req.body;

    const targetCategorySlug = categorySlug || (typeof category === 'object' ? category?.slug : category);

    if (!name || !price || !image || !targetCategorySlug) {
      return res.status(400).json({ success: false, message: 'Name, price, image, and category are required.' });
    }

    const generatedSlug = slug || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

    const newProductData = {
      name,
      slug: generatedSlug,
      gender: gender || 'women',
      categorySlug: targetCategorySlug,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      description: description || '',
      fabric: fabric || '100% Bio-Washed Combed Cotton (240 GSM)',
      fit: fit || 'Relaxed Fit',
      image,
      images: Array.isArray(images) && images.length ? images : [image],
      sizes: Array.isArray(sizes) && sizes.length ? sizes : ['XS', 'S', 'M', 'L', 'XL'],
      colors: Array.isArray(colors) && colors.length ? colors : ['#000000'],
      colorNames: Array.isArray(colorNames) && colorNames.length ? colorNames : ['Noir Black'],
      isNew: isNew !== undefined ? Boolean(isNew) : true,
      isSale: isSale !== undefined ? Boolean(isSale) : false,
      stock: stock ? parseInt(stock) : 50,
    };

    try {
      const product = await prisma.product.create({
        data: newProductData,
        include: { category: true },
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product,
      });
    } catch (dbErr) {
      // Fallback: Add to memory catalog if DB is offline
      const fallbackProd = { ...newProductData, id: `prod-${Date.now()}` };
      cleanCatalogData.unshift(fallbackProd);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product: fallbackProd,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const cleanData = {};
    if (body.name !== undefined) cleanData.name = body.name;
    if (body.slug !== undefined) cleanData.slug = body.slug;
    if (body.gender !== undefined) cleanData.gender = body.gender;
    if (body.description !== undefined) cleanData.description = body.description;
    if (body.fabric !== undefined) cleanData.fabric = body.fabric;
    if (body.fit !== undefined) cleanData.fit = body.fit;
    if (body.image !== undefined) cleanData.image = body.image;
    if (body.images !== undefined) cleanData.images = Array.isArray(body.images) ? body.images : [body.image];
    if (body.sizes !== undefined) cleanData.sizes = Array.isArray(body.sizes) ? body.sizes : [];
    if (body.colors !== undefined) cleanData.colors = Array.isArray(body.colors) ? body.colors : [];
    if (body.colorNames !== undefined) cleanData.colorNames = Array.isArray(body.colorNames) ? body.colorNames : [];
    if (body.isNew !== undefined) cleanData.isNew = Boolean(body.isNew);
    if (body.isSale !== undefined) cleanData.isSale = Boolean(body.isSale);
    if (body.rating !== undefined) cleanData.rating = parseFloat(body.rating) || 4.8;
    if (body.reviews !== undefined) cleanData.reviews = parseInt(body.reviews) || 0;
    if (body.stock !== undefined) cleanData.stock = parseInt(body.stock) || 50;
    if (body.price !== undefined) cleanData.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) cleanData.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;

    if (body.category) {
      cleanData.categorySlug = typeof body.category === 'object' ? body.category?.slug : body.category;
    } else if (body.categorySlug) {
      cleanData.categorySlug = body.categorySlug;
    }

    try {
      // Find existing product by ID or Slug
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });

      let product;
      if (existing) {
        product = await prisma.product.update({
          where: { id: existing.id },
          data: cleanData,
          include: { category: true },
        });
      } else {
        // Upsert if not found
        product = await prisma.product.create({
          data: {
            ...cleanData,
            name: cleanData.name || 'Atelier Garment',
            slug: cleanData.slug || id,
            price: cleanData.price || 1999,
            image: cleanData.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
            categorySlug: cleanData.categorySlug || 'pakistani-suits',
          },
          include: { category: true },
        });
      }

      return res.json({
        success: true,
        message: 'Product updated successfully.',
        product,
      });
    } catch (dbErr) {
      // If DB is offline, update in memory catalog
      const idx = cleanCatalogData.findIndex((p) => p.id === id || p.slug === id);
      const fallbackUpdated = { ...cleanData, id };
      if (idx !== -1) {
        cleanCatalogData[idx] = { ...cleanCatalogData[idx], ...cleanData };
      }
      return res.json({
        success: true,
        message: 'Product updated successfully.',
        product: fallbackUpdated,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      const existing = await prisma.product.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (existing) {
        await prisma.product.delete({ where: { id: existing.id } });
      }
    } catch {
      // ignore
    }

    const idx = cleanCatalogData.findIndex((p) => p.id === id || p.slug === id);
    if (idx !== -1) {
      cleanCatalogData.splice(idx, 1);
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

import prisma from '../config/prisma.js';

// Get All Products with Filters (Direct DB)
export const getProducts = async (req, res, next) => {
  try {
    const { gender, category, isSale, isNew, minPrice, maxPrice, search, sort } = req.query;

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
    console.error('[Product API Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products from database.',
      products: [],
    });
  }
};

// Get Single Product by ID or Slug (Direct DB)
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

// Create Product (Direct DB)
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

    const product = await prisma.product.create({
      data: {
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
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Update Product (Direct DB)
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

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product (Direct DB)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (existing) {
      await prisma.product.delete({ where: { id: existing.id } });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

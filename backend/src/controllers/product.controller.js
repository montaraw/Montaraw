import prisma from '../config/prisma.js';

export const getProducts = async (req, res, next) => {
  try {
    const { gender, category, isSale, isNew, minPrice, maxPrice, search, sort } = req.query;

    const where = {};

    if (gender && gender !== 'all') {
      where.OR = [{ gender: gender }, { gender: 'unisex' }];
    }

    if (category) {
      where.categorySlug = category;
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
    next(error);
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

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        gender: gender || 'women',
        categorySlug: targetCategorySlug,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        description,
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

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.category) {
      data.categorySlug = data.categorySlug || (typeof data.category === 'object' ? data.category?.slug : data.category);
      delete data.category;
    }

    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
    if (data.stock !== undefined) data.stock = parseInt(data.stock);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

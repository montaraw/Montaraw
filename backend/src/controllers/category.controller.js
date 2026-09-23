import prisma from '../config/prisma.js';
import { invalidateHomepageCache } from './homepage.controller.js';
import { cache } from '../services/cache.service.js';

// Get All Categories (Cached & High Performance)
export const getCategories = async (req, res, next) => {
  try {
    const CACHE_KEY = 'montaraw:categories:all';
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const responsePayload = {
      success: true,
      count: categories.length,
      categories,
    };

    cache.set(CACHE_KEY, responsePayload, 900);
    res.setHeader('X-Cache', 'MISS');

    res.json(responsePayload);
  } catch (error) {
    console.error('[Category API Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories from database.',
      categories: [],
    });
  }
};

// Create Category (Direct DB)
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, image, gender } = req.body;
    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'Category name and image URL are required.' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug: generatedSlug,
        image,
        gender: gender || 'unisex',
      },
    });

    invalidateHomepageCache();
    cache.del('montaraw:categories:*');

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// Update Category (Direct DB)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, image, gender, slug } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        image: image || undefined,
        gender: gender || undefined,
        slug: slug || undefined,
      },
    });

    invalidateHomepageCache();
    cache.del('montaraw:categories:*');

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Category (Direct DB)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });

    invalidateHomepageCache();
    cache.del('montaraw:categories:*');

    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

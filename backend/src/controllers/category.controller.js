import prisma from '../config/prisma.js';
import { isDatabaseAlive, setDatabaseOffline } from '../config/dbState.js';

const defaultAtelierCategories = [
  {
    name: 'Pakistani Suits',
    slug: 'pakistani-suits',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
  },
  {
    name: 'Suits',
    slug: 'suits',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  },
  {
    name: 'Cord Set',
    slug: 'cord-set',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  },
  {
    name: 'Men Streetwear',
    slug: 'men-streetwear',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
];

export const getCategories = async (req, res, next) => {
  if (!(await isDatabaseAlive())) {
    return res.json({ success: true, categories: defaultAtelierCategories });
  }

  try {
    let categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // If database contains old dummy categories (e.g. 'dresses', 'hoodies', 'bottoms'), clean them up
    const hasOldCategories = categories.some((c) =>
      ['dresses', 'oversized-tshirts', 'hoodies', 'co-ords', 'bottoms'].includes(c.slug)
    );

    if (hasOldCategories || categories.length === 0) {
      // Clean old categories
      await prisma.category.deleteMany({
        where: {
          slug: { in: ['dresses', 'oversized-tshirts', 'hoodies', 'co-ords', 'bottoms'] },
        },
      });

      // Upsert default atelier categories
      for (const cat of defaultAtelierCategories) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: { name: cat.name, gender: cat.gender, image: cat.image },
          create: cat,
        });
      }

      categories = await prisma.category.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
    }

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    setDatabaseOffline();
    return res.json({
      success: true,
      categories: defaultAtelierCategories,
    });
  }
};

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

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, image, gender } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        image,
        gender,
      },
    });

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

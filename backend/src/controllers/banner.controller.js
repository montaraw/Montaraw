import prisma from '../config/prisma.js';
import { invalidateHomepageCache } from './homepage.controller.js';

// Get All Banners (Direct DB)
export const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error('[Banner API Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve banners from database.',
      banners: [],
    });
  }
};

// Create Banner (Direct DB)
export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, headline, buttonText, link, image, order } = req.body;
    if (!title || !headline || !image) {
      return res.status(400).json({ success: false, message: 'Title, headline, and image URL are required.' });
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        headline,
        buttonText: buttonText || 'Explore Collection',
        link: link || '/shop',
        image,
        order: order ? parseInt(order) : 0,
      },
    });

    invalidateHomepageCache();

    res.status(201).json({
      success: true,
      message: 'Banner created successfully.',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

// Update Banner (Direct DB)
export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, headline, buttonText, link, image, order } = req.body;

    const data = {};
    if (title !== undefined) data.title = String(title).trim();
    if (subtitle !== undefined) data.subtitle = subtitle ? String(subtitle).trim() : '';
    if (headline !== undefined) data.headline = String(headline).trim();
    if (buttonText !== undefined) data.buttonText = String(buttonText).trim();
    if (link !== undefined) data.link = String(link).trim();
    if (image !== undefined) data.image = String(image).trim();
    if (order !== undefined) data.order = parseInt(order, 10) || 0;

    // Check if banner exists by id
    const existing = await prisma.banner.findUnique({ where: { id } }).catch(() => null);

    let banner;
    if (existing) {
      banner = await prisma.banner.update({
        where: { id },
        data,
      });
    } else {
      const count = await prisma.banner.count();
      banner = await prisma.banner.create({
        data: {
          title: data.title || 'NEW DROP',
          subtitle: data.subtitle || '',
          headline: data.headline || 'LUXURY ATELIER',
          buttonText: data.buttonText || 'Explore Collection',
          link: data.link || '/shop',
          image: data.image || '',
          order: data.order !== undefined ? data.order : count + 1,
        },
      });
    }

    invalidateHomepageCache();

    res.json({
      success: true,
      message: 'Banner updated successfully.',
      banner,
    });
  } catch (error) {
    console.error('[Update Banner Error]:', error.message);
    next(error);
  }
};

// Delete Banner (Direct DB)
export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });

    invalidateHomepageCache();

    res.json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

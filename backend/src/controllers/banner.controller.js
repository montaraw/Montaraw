import prisma from '../config/prisma.js';

export const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

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

    res.status(201).json({
      success: true,
      message: 'Banner created successfully.',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      message: 'Banner updated successfully.',
      banner,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

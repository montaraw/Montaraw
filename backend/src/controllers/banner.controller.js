import prisma from '../config/prisma.js';
import { isDatabaseAlive, setDatabaseOffline } from '../config/dbState.js';

const defaultBannersData = [
  {
    id: 'banner-1',
    title: "NEW COLLECTION '25",
    headline: 'BEYOND YOUR LIMITS',
    subtitle: 'Pakistani Suits, Anarkali Suits, and Modern Velvet Cord Sets crafted for the uncompromising.',
    buttonText: 'EXPLORE COLLECTION',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&q=85',
    order: 1,
  },
  {
    id: 'banner-2',
    title: "WOMEN'S ATELIER",
    headline: 'PAKISTANI & SUITS',
    subtitle: 'Intricate embroidery, pure Chiffon dupattas, and sculpted silhouettes.',
    buttonText: 'SHOP WOMEN',
    link: '/shop?gender=women',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=85',
    order: 2,
  },
  {
    id: 'banner-3',
    title: 'CORD SETS & COUTURE',
    headline: 'EFFORTLESS LUXURY',
    subtitle: 'Plush ribbed velvet cord sets and modern relaxed tailoring.',
    buttonText: 'SHOP CORD SETS',
    link: '/shop/cord-set',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=85',
    order: 3,
  },
];

export const getBanners = async (req, res, next) => {
  if (!(await isDatabaseAlive())) {
    return res.json({ success: true, banners: defaultBannersData });
  }

  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      banners: banners.length > 0 ? banners : defaultBannersData,
    });
  } catch (error) {
    setDatabaseOffline();
    return res.json({
      success: true,
      banners: defaultBannersData,
    });
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

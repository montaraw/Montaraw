import prisma from '../config/prisma.js';
import { invalidateHomepageCache } from './homepage.controller.js';
import { cache } from '../services/cache.service.js';

// Get Store Settings (Cached & High Performance)
export const getSettings = async (req, res, next) => {
  try {
    const CACHE_KEY = 'montaraw:settings:singleton';
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    let settings = await prisma.setting.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          id: 'singleton',
          brandName: 'MONTARAW',
          tagline: 'Born Raw. Stay Raw.',
          contactEmail: 'montarawsupport@gmail.com',
          contactPhone: '+91 97205 38576',
          contactPhoneSecondary: '+91 62064 24372',
          instagram: 'https://www.instagram.com/montarawsupport?igsi=MjJ2NWdrMGRtYzM1',
        },
      });
    }

    const responsePayload = {
      success: true,
      settings,
    };

    cache.set(CACHE_KEY, responsePayload, 900);
    res.setHeader('X-Cache', 'MISS');

    res.json(responsePayload);
  } catch (error) {
    console.error('[Settings API Error]:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings from database.',
    });
  }
};

// Update Store Settings (Direct DB)
export const updateSettings = async (req, res, next) => {
  try {
    const { brandName, tagline, contactEmail, contactPhone, contactPhoneSecondary, instagram } = req.body;

    const settings = await prisma.setting.upsert({
      where: { id: 'singleton' },
      update: {
        brandName: brandName || undefined,
        tagline: tagline || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        contactPhoneSecondary: contactPhoneSecondary !== undefined ? contactPhoneSecondary : undefined,
        instagram: instagram || undefined,
      },
      create: {
        id: 'singleton',
        brandName: brandName || 'MONTARAW',
        tagline: tagline || 'Born Raw. Stay Raw.',
        contactEmail: contactEmail || 'montarawsupport@gmail.com',
        contactPhone: contactPhone || '+91 97205 38576',
        contactPhoneSecondary: contactPhoneSecondary || '+91 62064 24372',
        instagram: instagram || 'https://www.instagram.com/montarawsupport?igsi=MjJ2NWdrMGRtYzM1',
      },
    });

    invalidateHomepageCache();
    cache.del('montaraw:settings:*');

    res.json({
      success: true,
      message: 'Store settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

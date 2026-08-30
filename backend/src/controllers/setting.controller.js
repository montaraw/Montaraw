import prisma from '../config/prisma.js';

export const getSettings = async (req, res, next) => {
  try {
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
          contactPhone: '+91 62064 24372',
          instagram: '@montaraw.atelier',
        },
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { brandName, tagline, contactEmail, contactPhone, instagram } = req.body;

    const settings = await prisma.setting.upsert({
      where: { id: 'singleton' },
      update: {
        brandName,
        tagline,
        contactEmail,
        contactPhone,
        instagram,
      },
      create: {
        id: 'singleton',
        brandName: brandName || 'MONTARAW',
        tagline: tagline || 'Born Raw. Stay Raw.',
        contactEmail: contactEmail || 'montarawsupport@gmail.com',
        contactPhone: contactPhone || '+91 62064 24372',
        instagram: instagram || '@montaraw.atelier',
      },
    });

    res.json({
      success: true,
      message: 'Store settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

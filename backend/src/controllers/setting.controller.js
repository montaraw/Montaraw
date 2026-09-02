import prisma from '../config/prisma.js';
import { isDatabaseAlive, setDatabaseOffline } from '../config/dbState.js';

const defaultStoreSettings = {
  id: 'singleton',
  brandName: 'MONTARAW',
  tagline: 'Born Raw. Stay Raw.',
  contactEmail: 'montarawsupport@gmail.com',
  contactPhone: '+91 97205 38576',
  contactPhoneSecondary: '+91 62064 24372',
  instagram: 'https://www.instagram.com/montarawsupport?igsi=MjJ2NWdrMGRtYzM1',
  facebook: 'https://www.facebook.com/share/17Vh8emhBD/',
};

export const getSettings = async (req, res, next) => {
  if (!(await isDatabaseAlive())) {
    return res.json({ success: true, settings: defaultStoreSettings });
  }

  try {
    let settings = await prisma.setting.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      settings = await prisma.setting.create({
        data: defaultStoreSettings,
      });
    }

    res.json({
      success: true,
      settings: settings || defaultStoreSettings,
    });
  } catch (error) {
    setDatabaseOffline();
    return res.json({
      success: true,
      settings: defaultStoreSettings,
    });
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { brandName, tagline, contactEmail, contactPhone, contactPhoneSecondary, instagram } = req.body;

    const settings = await prisma.setting.upsert({
      where: { id: 'singleton' },
      update: {
        brandName,
        tagline,
        contactEmail,
        contactPhone: contactPhone || '+91 97205 38576',
        contactPhoneSecondary: contactPhoneSecondary !== undefined ? contactPhoneSecondary : '+91 62064 24372',
        instagram,
      },
      create: {
        id: 'singleton',
        brandName: brandName || 'MONTARAW',
        tagline: tagline || 'Born Raw. Stay Raw.',
        contactEmail: contactEmail || 'montarawsupport@gmail.com',
        contactPhone: contactPhone || '+91 97205 38576',
        contactPhoneSecondary: contactPhoneSecondary || '+91 62064 24372',
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

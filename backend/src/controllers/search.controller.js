import prisma from '../config/prisma.js';

// Get Recent Searches (for customer if logged in, or global latest)
export const getRecentSearches = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'anonymous';

    const where = userId ? { userId } : { ipAddress };

    const records = await prisma.recentSearch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Deduplicate queries
    const uniqueQueries = [];
    const seen = new Set();
    for (const r of records) {
      const lower = r.query.trim().toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueQueries.push(r.query);
      }
      if (uniqueQueries.length >= 8) break;
    }

    res.json({
      success: true,
      searches: uniqueQueries,
    });
  } catch (error) {
    next(error);
  }
};

// Save a Search Query
export const saveRecentSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required.' });
    }

    const cleanQuery = query.trim();
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'anonymous';

    // Delete previous duplicate instances for clean ordering
    await prisma.recentSearch.deleteMany({
      where: {
        query: { equals: cleanQuery, mode: 'insensitive' },
        ...(userId ? { userId } : { ipAddress }),
      },
    });

    const record = await prisma.recentSearch.create({
      data: {
        query: cleanQuery,
        userId,
        ipAddress,
      },
    });

    res.status(201).json({
      success: true,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// Delete single recent search query
export const deleteRecentSearch = async (req, res, next) => {
  try {
    const { query } = req.params;
    const cleanQuery = query.trim();
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'anonymous';

    await prisma.recentSearch.deleteMany({
      where: {
        query: { equals: cleanQuery, mode: 'insensitive' },
        ...(userId ? { userId } : { ipAddress }),
      },
    });

    res.json({
      success: true,
      message: `Deleted '${cleanQuery}' from search history.`,
    });
  } catch (error) {
    next(error);
  }
};

// Clear All Recent Searches
export const clearAllRecentSearches = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'anonymous';

    await prisma.recentSearch.deleteMany({
      where: userId ? { userId } : { ipAddress },
    });

    res.json({
      success: true,
      message: 'Search history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

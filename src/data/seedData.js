// ==========================================
// MONTARAW — Database Schema Baseline Defaults
// All seed and catalog records are managed in backend/prisma/seed.js
// ==========================================

export const defaultBanners = [
  {
    id: 'banner-1',
    title: "NEW COLLECTION '25",
    headline: 'BEYOND YOUR LIMITS',
    subtitle: 'High-end streetwear and couture silhouettes crafted for the uncompromising.',
    buttonText: 'EXPLORE COLLECTION',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=85',
    order: 1,
  },
  {
    id: 'banner-2',
    title: "WOMEN'S ATELIER",
    headline: 'SCULPTED SILHOUETTES',
    subtitle: 'Liquid satin gowns, velvet eveningwear, and refined tailoring.',
    buttonText: 'SHOP WOMEN',
    link: '/shop?gender=women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=85',
    order: 2,
  },
  {
    id: 'banner-3',
    title: 'HEAVYWEIGHT STREETWEAR',
    headline: 'RAW UNFILTERED AESTHETICS',
    subtitle: '240 GSM drop shoulder essentials and 380 GSM fleece hoodies.',
    buttonText: 'SHOP MEN',
    link: '/shop?gender=men',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85',
    order: 3,
  },
];
export const defaultCategories = [];
export const defaultProducts = [];
export const defaultOrders = [];
export const defaultCoupons = [];

export const defaultSettings = {
  brandName: 'MONTARAW',
  tagline: 'Born Raw. Stay Raw.',
  contactEmail: 'montarawsupport@gmail.com',
  contactPhone: '+91 62064 24372',
  instagram: '@montaraw.atelier',
};

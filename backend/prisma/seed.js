import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Montaraw PostgreSQL Database Seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.setting.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 2. Seed Clean Admin User ONLY (Remove all other test/dummy users)
  const adminPasswordHash = await bcrypt.hash('adminmontaraw@6206', 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Montaraw Administrator',
      email: 'adminmontaraw@gmail.com',
      password: adminPasswordHash,
      phone: '6206424372',
      role: 'ADMIN',
      city: 'Muzzafarnagar',
      state: 'Uttar Pradesh',
      pincode: '251002',
      address: 'Flat no 102, GAZAWALI, SARWAT, Muzzafarnagar',
    },
  });

  console.log('👤 Seeded Dedicated Admin account (adminmontaraw@gmail.com).');

  // 3. Seed Categories
  const categoriesData = [
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

  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }
  console.log('📁 Seeded Categories.');

  // 4. Seed Products
  const productsData = [
    // PAKISTANI SUITS
    {
      name: 'Royal Embroidered Velvet Pakistani Suit',
      slug: 'royal-embroidered-velvet-pakistani-suit',
      gender: 'women',
      categorySlug: 'pakistani-suits',
      price: 5499,
      originalPrice: 7999,
      description: 'Heavily embroidered micro-velvet kurta featuring zari work, organza sleeve details, matched with raw silk straight trousers and heavily embellished chiffon dupatta.',
      fabric: 'Premium Micro Velvet & Pure Chiffon Dupatta',
      fit: 'Graceful Straight Cut',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#000000', '#3b1424', '#0d2b1d'],
      colorNames: ['Noir Black', 'Wine Maroon', 'Emerald Green'],
      isNew: true,
      isSale: false,
      rating: 4.9,
      reviews: 28,
      stock: 30,
    },
    {
      name: 'Lawn Floral Digital Print Pakistani Suit',
      slug: 'lawn-floral-digital-print-pakistani-suit',
      gender: 'women',
      categorySlug: 'pakistani-suits',
      price: 3899,
      originalPrice: 4999,
      description: 'Luxury digital print lawn suit with embroidered neckline patch, lace inserts, dyed cotton trousers, and a lightweight silk dupatta.',
      fabric: '100% Premium Lawn Cotton & Silk Dupatta',
      fit: 'Relaxed Tailored Fit',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#f5f5f5', '#2c3e50'],
      colorNames: ['Ivory Floral', 'Navy Slate'],
      isNew: true,
      isSale: true,
      rating: 4.8,
      reviews: 19,
      stock: 40,
    },
    // SUITS
    {
      name: 'Classic Handcrafted Anarkali Suit Set',
      slug: 'classic-handcrafted-anarkali-suit-set',
      gender: 'women',
      categorySlug: 'suits',
      price: 4499,
      originalPrice: 5999,
      description: 'Flowing floor-length flared Anarkali silhouette crafted from lightweight georgette, accented with gold thread borders and coordinating churidar pants.',
      fabric: 'Georgette with Soft Butter Crepe Lining',
      fit: 'Flared Anarkali Silhouette',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#3b1424', '#000000'],
      colorNames: ['Deep Crimson', 'Noir Black'],
      isNew: true,
      isSale: false,
      rating: 4.9,
      reviews: 32,
      stock: 35,
    },
    {
      name: 'Chanderi Silk Straight Kurta Pant Suit',
      slug: 'chanderi-silk-straight-kurta-pant-suit',
      gender: 'women',
      categorySlug: 'suits',
      price: 3299,
      originalPrice: 4299,
      description: 'Sophisticated Chanderi silk straight-cut suit with delicate thread work at yoke and hem, paired with tapered cigarette pants and organza dupatta.',
      fabric: 'Pure Chanderi Silk Blend',
      fit: 'Straight Tailored Fit',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#d4af37', '#000000'],
      colorNames: ['Royal Gold', 'Jet Black'],
      isNew: false,
      isSale: true,
      rating: 4.7,
      reviews: 15,
      stock: 45,
    },
    // CORD SET
    {
      name: 'Luxury Velvet Pleated Cord Set',
      slug: 'luxury-velvet-pleated-cord-set',
      gender: 'women',
      categorySlug: 'cord-set',
      price: 3699,
      originalPrice: 4999,
      description: 'Modern luxury cord set featuring a button-down tunic shirt with dropped shoulders and matching wide-leg trousers in rich ribbed velvet.',
      fabric: 'Premium Stretch Velvet Cord (320 GSM)',
      fit: 'Relaxed Wide-Leg Lounge Fit',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#000000', '#3b1424', '#2d3328'],
      colorNames: ['Noir Black', 'Wine Plum', 'Forest Olive'],
      isNew: true,
      isSale: false,
      rating: 4.9,
      reviews: 21,
      stock: 50,
    },
    {
      name: 'Pure Cotton Ribbed Casual Cord Set',
      slug: 'pure-cotton-ribbed-casual-cord-set',
      gender: 'women',
      categorySlug: 'cord-set',
      price: 2799,
      originalPrice: 3599,
      description: 'Minimalist 2-piece oversized shirt and high-waisted shorts/trouser cord set crafted for everyday statement comfort and streetwear elevation.',
      fabric: '100% Breathable Combed Rib Cotton (280 GSM)',
      fit: 'Oversized Boxy Fit',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#8a7968', '#000000', '#f5f5f5'],
      colorNames: ['Mocha Taupe', 'Noir Black', 'Off White'],
      isNew: true,
      isSale: true,
      rating: 4.8,
      reviews: 17,
      stock: 40,
    },
    // MEN STREETWEAR
    {
      name: '240 GSM Heavy Drop Shoulder Tee',
      slug: '240-gsm-heavy-drop-shoulder-tee',
      gender: 'men',
      categorySlug: 'men-streetwear',
      price: 1499,
      originalPrice: 1999,
      description: 'Our iconic signature 240 GSM drop shoulder tee. Built from 100% bio-washed combed cotton with dense 1.25-inch thick ribbed neck collar that never loses shape.',
      fabric: '100% Combed Compact Cotton (240 GSM)',
      fit: 'True Oversized Drop Shoulder',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#000000', '#f5f5f5', '#2d3328'],
      colorNames: ['Noir Black', 'Off White', 'Washed Olive'],
      isNew: true,
      isSale: false,
      rating: 4.9,
      reviews: 58,
      stock: 50,
    },
    {
      name: '380 GSM Heavyweight Street Hoodie',
      slug: '380-gsm-heavyweight-street-hoodie',
      gender: 'men',
      categorySlug: 'men-streetwear',
      price: 2999,
      originalPrice: 3999,
      description: 'Engineered for chilly street nights. 380 GSM brushed fleece with double-lined structural hood, deep kangaroo pocket, and heavy ribbed cuff trims.',
      fabric: '100% Heavy Brushed Fleece Cotton (380 GSM)',
      fit: 'Relaxed Streetwear Fit',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#000000', '#2d2d2d', '#8a7968'],
      colorNames: ['Noir Black', 'Dark Charcoal', 'Vintage Mocha'],
      isNew: true,
      isSale: false,
      rating: 4.9,
      reviews: 42,
      stock: 35,
    },
  ];

  for (const product of productsData) {
    await prisma.product.create({ data: product });
  }
  console.log(`📦 Seeded ${productsData.length} Products.`);

  // 5. Seed Banners
  const bannersData = [
    {
      title: "NEW COLLECTION '25",
      headline: 'BEYOND YOUR LIMITS',
      subtitle: 'Pakistani Suits, Anarkali Suits, and Modern Velvet Cord Sets crafted for the uncompromising.',
      buttonText: 'EXPLORE COLLECTION',
      link: '/shop',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&q=85',
      order: 1,
    },
    {
      title: "WOMEN'S ATELIER",
      headline: 'PAKISTANI & SUITS',
      subtitle: 'Intricate embroidery, pure Chiffon dupattas, and sculpted silhouettes.',
      buttonText: 'SHOP WOMEN',
      link: '/shop?gender=women',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=85',
      order: 2,
    },
    {
      title: 'CORD SETS & COUTURE',
      headline: 'EFFORTLESS LUXURY',
      subtitle: 'Plush ribbed velvet cord sets and modern relaxed tailoring.',
      buttonText: 'SHOP CORD SETS',
      link: '/shop/cord-set',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=85',
      order: 3,
    },
  ];

  for (const banner of bannersData) {
    await prisma.banner.create({ data: banner });
  }
  console.log('🖼️ Seeded Banners.');

  // 6. Seed Coupons
  const couponsData = [
    { code: 'MONTARAW10', discount: 10, type: 'percentage', minOrder: 1000 },
    { code: 'RAW20', discount: 20, type: 'percentage', minOrder: 3500 },
    { code: 'FREESHIP', discount: 150, type: 'fixed', minOrder: 1500 },
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.create({ data: coupon });
  }
  console.log('🏷️ Seeded Coupons.');

  // 7. Seed Settings
  await prisma.setting.create({
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
  console.log('⚙️ Seeded Store Settings.');
  console.log('✅ Montaraw Database Seeding completed cleanly (0 Dummy Orders)!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

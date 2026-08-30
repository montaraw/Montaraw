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
      name: 'Dresses & Gowns',
      slug: 'dresses',
      gender: 'women',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    },
    {
      name: 'Oversized T-Shirts',
      slug: 'oversized-tshirts',
      gender: 'unisex',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    },
    {
      name: 'Heavy Hoodies',
      slug: 'hoodies',
      gender: 'unisex',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    },
    {
      name: 'Co-Ords & Sets',
      slug: 'co-ords',
      gender: 'unisex',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    },
    {
      name: 'Bottoms & Cargos',
      slug: 'bottoms',
      gender: 'unisex',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }
  console.log('📁 Seeded Categories.');

  // 4. Seed Products
  const productsData = [
    // WOMEN EXCLUSIVE DRESSES
    {
      name: 'Noir Velvet Cutout Midi Dress',
      slug: 'noir-velvet-cutout-midi-dress',
      gender: 'women',
      categorySlug: 'dresses',
      price: 3499,
      originalPrice: 4999,
      description: 'Sculpted from plush stretch midnight velvet with strategic architectural waist cutouts and an asymmetric hemline. Engineered for private dinners and night parties.',
      fabric: '95% Micro-Poly Velvet, 5% Elastane (310 GSM)',
      fit: 'Bodycon Sculpted Fit',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      ],
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['#000000', '#3b1424'],
      colorNames: ['Noir Black', 'Wine Burgundy'],
      isNew: true,
      isSale: false,
      rating: 4.9,
      reviews: 24,
      stock: 45,
    },
    {
      name: 'Satin Backless Halter Gown',
      slug: 'satin-backless-halter-gown',
      gender: 'women',
      categorySlug: 'dresses',
      price: 3999,
      originalPrice: 5499,
      description: 'High-shine fluid liquid satin maxi gown featuring an open back with delicate adjustable cross ties and a dramatic side thigh slit.',
      fabric: '100% Premium Liquid Silk-Satin',
      fit: 'Fluid Draped Silhouette',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      ],
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['#3b1424', '#000000', '#c0c0c0'],
      colorNames: ['Deep Wine', 'Noir Black', 'Liquid Silver'],
      isNew: true,
      isSale: true,
      rating: 4.8,
      reviews: 18,
      stock: 35,
    },
    {
      name: 'Structured Corset Slip Dress',
      slug: 'structured-corset-slip-dress',
      gender: 'women',
      categorySlug: 'dresses',
      price: 2899,
      originalPrice: 3899,
      description: 'Structured boned bodice with sweetheart neckline and minimalist straight drape. Designed to transition seamlessly from evening gallery openings to late-night lounges.',
      fabric: 'Structured Crepe Blend with Satin Lining',
      fit: 'Tailored Corset Fit',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80'],
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['#000000', '#f5f5f5'],
      colorNames: ['Noir Black', 'Off White'],
      isNew: false,
      isSale: true,
      rating: 4.7,
      reviews: 14,
      stock: 40,
    },
    {
      name: 'Cropped Raw Edge Atelier Hoodie',
      slug: 'cropped-raw-edge-atelier-hoodie',
      gender: 'women',
      categorySlug: 'hoodies',
      price: 2499,
      originalPrice: 3299,
      description: 'Heavyweight boxy cropped hoodie featuring raw unhemmed edges, dropped shoulders, and subtle high-density tonal silicon atelier branding on chest.',
      fabric: '100% French Terry Cotton (360 GSM)',
      fit: 'Boxy Cropped Fit',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'],
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['#2d2d2d', '#000000'],
      colorNames: ['Acid Charcoal', 'Noir Black'],
      isNew: true,
      isSale: false,
      rating: 4.8,
      reviews: 32,
      stock: 60,
    },

    // MEN EXCLUSIVE STREETWEAR
    {
      name: '240 GSM Heavy Drop Shoulder Tee',
      slug: '240-gsm-heavy-drop-shoulder-tee',
      gender: 'men',
      categorySlug: 'oversized-tshirts',
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
      stock: 120,
    },
    {
      name: '380 GSM Heavyweight Street Hoodie',
      slug: '380-gsm-heavyweight-street-hoodie',
      gender: 'men',
      categorySlug: 'hoodies',
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
      stock: 80,
    },
    {
      name: 'Tactical Multi-Pocket Cargo Pants',
      slug: 'tactical-multi-pocket-cargo-pants',
      gender: 'men',
      categorySlug: 'bottoms',
      price: 2799,
      originalPrice: 3699,
      description: 'Heavy duty twill weave with 6 functional snap cargo pockets, relaxed knee articulation, and adjustable elastic ankle bungees for tailored sneakers styling.',
      fabric: '100% Cotton Heavyweight Ripstop Twill (280 GSM)',
      fit: 'Relaxed Tapered Fit with Bungee Cuffs',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'],
      sizes: ['30', '32', '34', '36'],
      colors: ['#000000', '#2d3328'],
      colorNames: ['Tactical Black', 'Military Olive'],
      isNew: false,
      isSale: true,
      rating: 4.8,
      reviews: 29,
      stock: 65,
    },
    {
      name: 'Minimalist Relaxed Fit Trousers',
      slug: 'minimalist-relaxed-fit-trousers',
      gender: 'men',
      categorySlug: 'bottoms',
      price: 2499,
      originalPrice: 3299,
      description: 'Clean front pleats, hidden elastic waistband insert, and heavy draped cotton-twill blend. Engineered to style with oversized tees and chunky sneakers.',
      fabric: '65% Cotton, 35% Polyester Heavyweight Draped Twill',
      fit: 'Relaxed Wide Leg Straight Cut',
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
      images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80'],
      sizes: ['30', '32', '34', '36'],
      colors: ['#000000', '#8a7968'],
      colorNames: ['Noir Black', 'Sand Mocha'],
      isNew: true,
      isSale: false,
      rating: 4.7,
      reviews: 19,
      stock: 50,
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
      subtitle: 'High-end streetwear and couture silhouettes crafted for the uncompromising.',
      buttonText: 'EXPLORE COLLECTION',
      link: '/shop',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=85',
      order: 1,
    },
    {
      title: "WOMEN'S ATELIER",
      headline: 'SCULPTED SILHOUETTES',
      subtitle: 'Liquid satin gowns, velvet eveningwear, and refined tailoring.',
      buttonText: 'SHOP WOMEN',
      link: '/shop?gender=women',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=85',
      order: 2,
    },
    {
      title: 'HEAVYWEIGHT STREETWEAR',
      headline: 'RAW UNFILTERED AESTHETICS',
      subtitle: '240 GSM drop shoulder essentials and 380 GSM fleece hoodies.',
      buttonText: 'SHOP MEN',
      link: '/shop?gender=men',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85',
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
      contactPhone: '+91 62064 24372',
      instagram: '@montaraw.atelier',
    },
  });
  console.log('⚙️ Seeded Store Settings.');

  // 8. Seed Initial Sample Orders for Tracking
  await prisma.order.create({
    data: {
      id: 'MTR-88421',
      userId: null,
      customerName: 'Aarav Sharma',
      customerEmail: 'aarav@example.com',
      customerPhone: '6206424372',
      address: '402 Palm Avenue, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      subtotal: 3499,
      discount: 349.9,
      couponCode: 'MONTARAW10',
      shipping: 0,
      total: 3149.1,
      paymentMethod: 'UPI / Online',
      status: 'Shipped',
      trackingNumber: 'AWB-DEL-9842187',
      items: {
        create: [
          {
            name: 'Noir Velvet Cutout Midi Dress',
            size: 'M',
            color: '#000000',
            colorName: 'Noir Black',
            price: 3499,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      id: 'MTR-88410',
      userId: null,
      customerName: 'Riya Kapoor',
      customerEmail: 'riya@example.com',
      customerPhone: '9811223344',
      address: '12 Ring Road, Hauz Khas',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      subtotal: 4498,
      discount: 0,
      shipping: 0,
      total: 4498,
      paymentMethod: 'Credit / Debit Card',
      status: 'Processing',
      items: {
        create: [
          {
            name: '240 GSM Heavy Drop Shoulder Tee',
            size: 'L',
            color: '#000000',
            colorName: 'Noir Black',
            price: 1499,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
          },
          {
            name: '380 GSM Heavyweight Street Hoodie',
            size: 'L',
            color: '#000000',
            colorName: 'Noir Black',
            price: 2999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
          },
        ],
      },
    },
  });

  console.log('📦 Seeded Sample Customer Orders.');
  console.log('✅ Montaraw Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

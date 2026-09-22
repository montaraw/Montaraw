/**
 * Indian E-Commerce Tax & Distance-Based Delivery Engine
 * Real apparel GST rules & Zone-wise shipping courier matrix.
 */

// Delivery Zone Mapping from Store Base (North India / Uttar Pradesh)
export const STATE_ZONES = {
  // Zone 1: Local / North Near (Intra-State & Neighboring)
  'Uttar Pradesh': { zone: 'Zone 1 (Local/Intra-State)', standard: 49, express: 99, days: '2-3 Days', isHomeState: true },
  'Delhi': { zone: 'Zone 1 (Delhi NCR)', standard: 49, express: 99, days: '2-3 Days', isHomeState: false },
  'Haryana': { zone: 'Zone 1 (North Near)', standard: 49, express: 99, days: '2-3 Days', isHomeState: false },
  'Uttarakhand': { zone: 'Zone 1 (North Near)', standard: 49, express: 99, days: '2-3 Days', isHomeState: false },

  // Zone 2: North & Central Region
  'Punjab': { zone: 'Zone 2 (North)', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Rajasthan': { zone: 'Zone 2 (North-West)', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Himachal Pradesh': { zone: 'Zone 2 (North Hills)', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Madhya Pradesh': { zone: 'Zone 2 (Central)', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Bihar': { zone: 'Zone 2 (East Central)', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Chandigarh': { zone: 'Zone 2 (North)', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },

  // Zone 3: Major Metros, West & South Regions
  'Maharashtra': { zone: 'Zone 3 (West / Mumbai Metro)', standard: 89, express: 139, days: '3-5 Days', isHomeState: false },
  'Gujarat': { zone: 'Zone 3 (West)', standard: 89, express: 139, days: '3-5 Days', isHomeState: false },
  'Karnataka': { zone: 'Zone 3 (South / Bengaluru Metro)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Telangana': { zone: 'Zone 3 (South / Hyderabad)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Tamil Nadu': { zone: 'Zone 3 (South / Chennai)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'West Bengal': { zone: 'Zone 3 (East / Kolkata)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Andhra Pradesh': { zone: 'Zone 3 (South)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Kerala': { zone: 'Zone 3 (South)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Goa': { zone: 'Zone 3 (West Coast)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Odisha': { zone: 'Zone 3 (East Coast)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Jharkhand': { zone: 'Zone 3 (East)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Chhattisgarh': { zone: 'Zone 3 (Central East)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },

  // Zone 4: North-East, Special & Remote Territories
  'Assam': { zone: 'Zone 4 (North East)', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Meghalaya': { zone: 'Zone 4 (North East)', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Tripura': { zone: 'Zone 4 (North East)', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Jammu and Kashmir': { zone: 'Zone 4 (Special Terrain)', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Ladakh': { zone: 'Zone 4 (Remote Hills)', standard: 139, express: 199, days: '6-8 Days', isHomeState: false },
  'Other': { zone: 'Zone 3 (Standard Pan-India)', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
};

/**
 * Calculates distance/state-based delivery fee
 */
export function calculateDeliveryFee(state = 'Uttar Pradesh', deliveryType = 'standard') {
  const cleanState = state?.trim() || 'Uttar Pradesh';
  const zoneInfo = STATE_ZONES[cleanState] || STATE_ZONES['Other'];
  const fee = deliveryType === 'express' ? zoneInfo.express : zoneInfo.standard;

  return {
    deliveryFee: fee,
    zoneName: zoneInfo.zone,
    estimatedDays: deliveryType === 'express' ? '1-2 Days (Express Air)' : zoneInfo.days,
    isHomeState: Boolean(zoneInfo.isHomeState),
    state: cleanState,
  };
}

/**
 * Indian Apparel GST Calculation
 * - Garments <= ₹1,000: 5% GST
 * - Garments > ₹1,000: 12% GST
 * - Intra-State (UP): CGST + SGST (split equally)
 * - Inter-State: IGST (full)
 */
export function calculateClothingGst(cartItems = [], subtotalAfterDiscount = 0, targetState = 'Uttar Pradesh') {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      totalGst: 0,
      effectiveRate: '5%',
      isInterState: false,
      cgst: 0,
      sgst: 0,
      igst: 0,
      breakdownText: '5% Apparel GST',
    };
  }

  const rawSubtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const discountRatio = rawSubtotal > 0 ? Math.max(0, subtotalAfterDiscount / rawSubtotal) : 1;

  let totalGst = 0;
  let hasLuxurySlab = false; // > ₹1000
  let hasStandardSlab = false; // <= ₹1000

  cartItems.forEach((item) => {
    const itemPrice = (item.price || 0) * discountRatio;
    const qty = item.quantity || 1;
    // 5% if item unit price <= 1000, 12% if item unit price > 1000
    const rate = (item.price || 0) <= 1000 ? 0.05 : 0.12;
    if (rate === 0.12) hasLuxurySlab = true;
    if (rate === 0.05) hasStandardSlab = true;

    totalGst += itemPrice * qty * rate;
  });

  const roundedGst = Math.round(totalGst);
  const isInterState = targetState && targetState.toLowerCase() !== 'uttar pradesh';

  const cgst = isInterState ? 0 : Math.round(roundedGst / 2);
  const sgst = isInterState ? 0 : roundedGst - cgst;
  const igst = isInterState ? roundedGst : 0;

  let rateLabel = '5%';
  if (hasLuxurySlab && hasStandardSlab) rateLabel = '5% & 12%';
  else if (hasLuxurySlab) rateLabel = '12%';

  return {
    totalGst: roundedGst,
    effectiveRate: rateLabel,
    isInterState,
    cgst,
    sgst,
    igst,
    breakdownText: isInterState
      ? `${rateLabel} IGST (Inter-State)`
      : `${rateLabel} GST (${hasLuxurySlab ? '6%' : '2.5%'} CGST + ${hasLuxurySlab ? '6%' : '2.5%'} SGST)`,
  };
}

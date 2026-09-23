/**
 * Indian E-Commerce Tax & Distance-Based Delivery Engine
 * Real apparel GST rules & Zone-wise shipping courier matrix.
 */

// Delivery Zone Mapping from Store Base (Courier tiers without state tags)
export const STATE_ZONES = {
  // Tier 1: Local / Near Hub
  'Uttar Pradesh': { zone: 'Priority Express Delivery', standard: 49, express: 99, days: '2-3 Days', isHomeState: true },
  'Delhi': { zone: 'Priority Express Delivery', standard: 49, express: 99, days: '2-3 Days', isHomeState: false },
  'Haryana': { zone: 'Priority Express Delivery', standard: 49, express: 99, days: '2-3 Days', isHomeState: false },
  'Uttarakhand': { zone: 'Priority Express Delivery', standard: 49, express: 99, days: '2-3 Days', isHomeState: false },

  // Tier 2: Regional Hubs
  'Punjab': { zone: 'Standard Priority Courier', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Rajasthan': { zone: 'Standard Priority Courier', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Himachal Pradesh': { zone: 'Standard Priority Courier', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Madhya Pradesh': { zone: 'Standard Priority Courier', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Bihar': { zone: 'Standard Priority Courier', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },
  'Chandigarh': { zone: 'Standard Priority Courier', standard: 69, express: 119, days: '3-4 Days', isHomeState: false },

  // Tier 3: Major Metros & National Coverage
  'Maharashtra': { zone: 'Standard National Courier', standard: 89, express: 139, days: '3-5 Days', isHomeState: false },
  'Gujarat': { zone: 'Standard National Courier', standard: 89, express: 139, days: '3-5 Days', isHomeState: false },
  'Karnataka': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Telangana': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Tamil Nadu': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'West Bengal': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Andhra Pradesh': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Kerala': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Goa': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Odisha': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Jharkhand': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Chhattisgarh': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },

  // Tier 4: Special & Extended Logistics
  'Assam': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Meghalaya': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Tripura': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Manipur': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Mizoram': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Nagaland': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Arunachal Pradesh': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Sikkim': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Jammu and Kashmir': { zone: 'Extended Logistics Delivery', standard: 119, express: 169, days: '5-7 Days', isHomeState: false },
  'Ladakh': { zone: 'Extended Logistics Delivery', standard: 139, express: 199, days: '6-8 Days', isHomeState: false },
  'Puducherry': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Dadra and Nagar Haveli and Daman and Diu': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
  'Andaman and Nicobar Islands': { zone: 'Extended Logistics Delivery', standard: 139, express: 199, days: '6-9 Days', isHomeState: false },
  'Lakshadweep': { zone: 'Extended Logistics Delivery', standard: 139, express: 199, days: '6-9 Days', isHomeState: false },
  'Other': { zone: 'Standard National Courier', standard: 89, express: 139, days: '4-5 Days', isHomeState: false },
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

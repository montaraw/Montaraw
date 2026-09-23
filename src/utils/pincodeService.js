/**
 * Indian Postal PIN Code Lookup & Address Validation Utility
 * Montaraw Atelier Luxury Streetwear
 */

// In-memory cache for fast lookups
const pincodeCache = new Map();

// Offline fallback mapping for Indian Postal Circles (2-digit prefix)
const PIN_PREFIX_MAP = {
  // Northern Region
  '11': { state: 'Delhi', city: 'New Delhi' },
  '12': { state: 'Haryana', city: 'Gurugram' },
  '13': { state: 'Haryana', city: 'Ambala' },
  '14': { state: 'Punjab', city: 'Ludhiana' },
  '15': { state: 'Punjab', city: 'Bathinda' },
  '16': { state: 'Chandigarh', city: 'Chandigarh' },
  '17': { state: 'Himachal Pradesh', city: 'Shimla' },
  '18': { state: 'Jammu and Kashmir', city: 'Jammu' },
  '19': { state: 'Jammu and Kashmir', city: 'Srinagar' },
  '20': { state: 'Uttar Pradesh', city: 'Aligarh / Noida' },
  '21': { state: 'Uttar Pradesh', city: 'Prayagraj' },
  '22': { state: 'Uttar Pradesh', city: 'Lucknow' },
  '23': { state: 'Uttar Pradesh', city: 'Varanasi' },
  '24': { state: 'Uttarakhand', city: 'Dehradun' },
  '25': { state: 'Uttar Pradesh', city: 'Meerut / Muzaffarnagar' },
  '26': { state: 'Uttarakhand', city: 'Nainital / Haldwani' },
  '27': { state: 'Uttar Pradesh', city: 'Gorakhpur' },
  '28': { state: 'Uttar Pradesh', city: 'Agra' },

  // Western & Central Region
  '30': { state: 'Rajasthan', city: 'Jaipur' },
  '31': { state: 'Rajasthan', city: 'Udaipur' },
  '32': { state: 'Rajasthan', city: 'Kota' },
  '33': { state: 'Rajasthan', city: 'Bikaner' },
  '34': { state: 'Rajasthan', city: 'Jodhpur' },
  '36': { state: 'Gujarat', city: 'Rajkot' },
  '37': { state: 'Gujarat', city: 'Kutch / Bhuj' },
  '38': { state: 'Gujarat', city: 'Ahmedabad' },
  '39': { state: 'Gujarat', city: 'Surat / Vadodara' },
  '40': { state: 'Maharashtra', city: 'Mumbai' },
  '41': { state: 'Maharashtra', city: 'Pune' },
  '42': { state: 'Maharashtra', city: 'Nashik' },
  '43': { state: 'Maharashtra', city: 'Aurangabad' },
  '44': { state: 'Maharashtra', city: 'Nagpur' },
  '45': { state: 'Madhya Pradesh', city: 'Indore' },
  '46': { state: 'Madhya Pradesh', city: 'Bhopal' },
  '47': { state: 'Madhya Pradesh', city: 'Gwalior' },
  '48': { state: 'Madhya Pradesh', city: 'Jabalpur' },
  '49': { state: 'Chhattisgarh', city: 'Raipur' },

  // Southern Region
  '50': { state: 'Telangana', city: 'Hyderabad' },
  '51': { state: 'Andhra Pradesh', city: 'Tirupati / Kadapa' },
  '52': { state: 'Andhra Pradesh', city: 'Vijayawada' },
  '53': { state: 'Andhra Pradesh', city: 'Visakhapatnam' },
  '56': { state: 'Karnataka', city: 'Bengaluru' },
  '57': { state: 'Karnataka', city: 'Mangalore' },
  '58': { state: 'Karnataka', city: 'Hubballi / Belagavi' },
  '59': { state: 'Karnataka', city: 'Belagavi' },
  '60': { state: 'Tamil Nadu', city: 'Chennai' },
  '61': { state: 'Tamil Nadu', city: 'Thanjavur / Trichy' },
  '62': { state: 'Tamil Nadu', city: 'Madurai' },
  '63': { state: 'Tamil Nadu', city: 'Salem / Vellore' },
  '64': { state: 'Tamil Nadu', city: 'Coimbatore' },
  '67': { state: 'Kerala', city: 'Kozhikode' },
  '68': { state: 'Kerala', city: 'Kochi' },
  '69': { state: 'Kerala', city: 'Thiruvananthapuram' },

  // Eastern & North-Eastern Region
  '70': { state: 'West Bengal', city: 'Kolkata' },
  '71': { state: 'West Bengal', city: 'Howrah / Asansol' },
  '72': { state: 'West Bengal', city: 'Medinipur' },
  '73': { state: 'West Bengal', city: 'Siliguri' },
  '74': { state: 'West Bengal', city: 'North 24 Parganas' },
  '75': { state: 'Odisha', city: 'Bhubaneswar' },
  '76': { state: 'Odisha', city: 'Berhampur' },
  '77': { state: 'Odisha', city: 'Rourkela / Sambalpur' },
  '78': { state: 'Assam', city: 'Guwahati' },
  '79': { state: 'Meghalaya', city: 'Shillong' },
  '80': { state: 'Bihar', city: 'Patna' },
  '81': { state: 'Bihar', city: 'Bhagalpur' },
  '82': { state: 'Bihar', city: 'Gaya' },
  '83': { state: 'Jharkhand', city: 'Ranchi / Jamshedpur' },
  '84': { state: 'Bihar', city: 'Muzaffarpur' },
  '85': { state: 'Bihar', city: 'Purnia' },
};

// Map alternate state name spellings to standard names
const STATE_NAME_NORMALIZER = {
  'delhi': 'Delhi',
  'nct of delhi': 'Delhi',
  'new delhi': 'Delhi',
  'uttar pradesh': 'Uttar Pradesh',
  'maharashtra': 'Maharashtra',
  'karnataka': 'Karnataka',
  'tamil nadu': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'west bengal': 'West Bengal',
  'bengal': 'West Bengal',
  'gujarat': 'Gujarat',
  'rajasthan': 'Rajasthan',
  'telangana': 'Telangana',
  'andhra pradesh': 'Andhra Pradesh',
  'kerala': 'Kerala',
  'madhya pradesh': 'Madhya Pradesh',
  'punjab': 'Punjab',
  'haryana': 'Haryana',
  'bihar': 'Bihar',
  'odisha': 'Odisha',
  'orissa': 'Odisha',
  'assam': 'Assam',
  'jharkhand': 'Jharkhand',
  'chhattisgarh': 'Chhattisgarh',
  'uttarakhand': 'Uttarakhand',
  'uttaranchal': 'Uttarakhand',
  'himachal pradesh': 'Himachal Pradesh',
  'goa': 'Goa',
  'tripura': 'Tripura',
  'meghalaya': 'Meghalaya',
  'manipur': 'Manipur',
  'nagaland': 'Nagaland',
  'mizoram': 'Mizoram',
  'arunachal pradesh': 'Arunachal Pradesh',
  'sikkim': 'Sikkim',
  'chandigarh': 'Chandigarh',
  'jammu and kashmir': 'Jammu and Kashmir',
  'jammu & kashmir': 'Jammu and Kashmir',
  'ladakh': 'Ladakh',
  'puducherry': 'Puducherry',
  'pondicherry': 'Puducherry',
  'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'andaman and nicobar islands': 'Andaman and Nicobar Islands',
  'lakshadweep': 'Lakshadweep',
};

/**
 * Standardize state name matching
 */
export function normalizeStateName(rawState) {
  if (!rawState) return 'Uttar Pradesh';
  const clean = rawState.trim().toLowerCase();
  return STATE_NAME_NORMALIZER[clean] || rawState.trim();
}

/**
 * Validates PIN code format (Indian 6-digit format starting with 1-9)
 */
export function isValidPinFormat(pincode) {
  if (!pincode) return false;
  const clean = String(pincode).trim();
  return /^[1-9][0-9]{5}$/.test(clean);
}

/**
 * Validates Indian Phone Number (10 digits, starts with 6, 7, 8, 9)
 */
export function isValidIndianPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Validates street address (requires minimum meaningful characters, house/street info)
 */
export function validateAddressLine(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Delivery address is required' };
  }
  const clean = address.trim();
  if (clean.length < 6) {
    return { valid: false, error: 'Please enter a complete address (House/Flat No, Street, Area)' };
  }
  // Check if it's not purely repeating characters or numbers
  if (/^(\d+|[a-zA-Z])\1+$/.test(clean) || /^[^a-zA-Z0-9]+$/.test(clean)) {
    return { valid: false, error: 'Please enter a valid, recognizable street address' };
  }
  return { valid: true };
}

/**
 * Fetch City and State from PIN Code with API + Fallback Cache
 */
export async function lookupPincode(pincode) {
  const cleanPin = String(pincode || '').replace(/\D/g, '').trim();

  if (!cleanPin || cleanPin.length !== 6) {
    return {
      success: false,
      error: 'PIN code must be exactly 6 digits',
    };
  }

  if (!isValidPinFormat(cleanPin)) {
    return {
      success: false,
      error: 'Please enter a valid Indian postal code (starts with 1-9)',
    };
  }

  // Check cache first
  if (pincodeCache.has(cleanPin)) {
    return pincodeCache.get(cleanPin);
  }

  // Abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const offices = data[0].PostOffice;
      // Get the primary delivery district/city
      const primaryOffice = offices.find((o) => o.DeliveryStatus === 'Delivery') || offices[0];
      let rawDistrict = (primaryOffice.District || primaryOffice.Division || primaryOffice.Name || '').replace(/\([^)]*\)/g, '').trim();
      
      // Handle known metro district mappings where India Post gives sub-region
      if (cleanPin.startsWith('400') && (!rawDistrict || rawDistrict.toLowerCase().includes('raigarh'))) {
        rawDistrict = 'Mumbai';
      } else if (cleanPin.startsWith('110') && !rawDistrict) {
        rawDistrict = 'New Delhi';
      }

      const city = rawDistrict || primaryOffice.Name || 'Local Area';
      const rawState = primaryOffice.State || '';
      const state = normalizeStateName(rawState);

      const result = {
        success: true,
        pincode: cleanPin,
        city: city.trim(),
        state,
        district: city.trim(),
        postOffices: offices.map((o) => o.Name),
        source: 'india-post-api',
      };

      pincodeCache.set(cleanPin, result);
      return result;
    } else {
      // API responded but no postal office was found for this 6-digit code
      const prefix = cleanPin.substring(0, 2);
      if (PIN_PREFIX_MAP[prefix]) {
        // Fallback to regional data if available
        const fallback = PIN_PREFIX_MAP[prefix];
        const result = {
          success: true,
          pincode: cleanPin,
          city: fallback.city,
          state: fallback.state,
          district: fallback.city,
          source: 'regional-fallback',
        };
        pincodeCache.set(cleanPin, result);
        return result;
      }

      return {
        success: false,
        error: 'PIN code not found in Indian postal registry',
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[pincodeService] Network fetch notice:', err.message);

    // Use local prefix map as resilient offline fallback
    const prefix = cleanPin.substring(0, 2);
    if (PIN_PREFIX_MAP[prefix]) {
      const fallback = PIN_PREFIX_MAP[prefix];
      const result = {
        success: true,
        pincode: cleanPin,
        city: fallback.city,
        state: fallback.state,
        district: fallback.city,
        source: 'offline-fallback',
      };
      pincodeCache.set(cleanPin, result);
      return result;
    }

    return {
      success: false,
      error: 'Unable to verify PIN code. Please enter city and state manually.',
    };
  }
}

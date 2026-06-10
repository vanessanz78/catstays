export interface TaxConfig {
  taxType: string;
  taxLabel: string;
  defaultRate: number;
  country: string;
  region?: string;
}

export function detectTaxFromAddress(address: string): TaxConfig {
  const addressLower = address.toLowerCase();
  
  // New Zealand
  if (
    addressLower.includes('new zealand') || 
    addressLower.includes('nz') ||
    addressLower.includes('auckland') ||
    addressLower.includes('wellington') ||
    addressLower.includes('christchurch')
  ) {
    return {
      taxType: 'GST',
      taxLabel: 'GST (New Zealand)',
      defaultRate: 15,
      country: 'New Zealand',
    };
  }
  
  // Australia
  if (
    addressLower.includes('australia') || 
    addressLower.includes('sydney') ||
    addressLower.includes('melbourne') ||
    addressLower.includes('brisbane') ||
    addressLower.includes('perth') ||
    addressLower.includes('adelaide')
  ) {
    return {
      taxType: 'GST',
      taxLabel: 'GST (Australia)',
      defaultRate: 10,
      country: 'Australia',
    };
  }
  
  // United Kingdom
  if (
    addressLower.includes('united kingdom') || 
    addressLower.includes('uk') ||
    addressLower.includes('england') ||
    addressLower.includes('scotland') ||
    addressLower.includes('wales') ||
    addressLower.includes('london') ||
    addressLower.includes('manchester') ||
    addressLower.includes('birmingham')
  ) {
    return {
      taxType: 'VAT',
      taxLabel: 'VAT (United Kingdom)',
      defaultRate: 20,
      country: 'United Kingdom',
    };
  }
  
  // Ireland
  if (
    addressLower.includes('ireland') || 
    addressLower.includes('dublin') ||
    addressLower.includes('cork')
  ) {
    return {
      taxType: 'VAT',
      taxLabel: 'VAT (Ireland)',
      defaultRate: 23,
      country: 'Ireland',
    };
  }
  
  // European Union countries
  const euCountries = [
    { keywords: ['france', 'paris', 'lyon', 'marseille'], country: 'France', rate: 20 },
    { keywords: ['germany', 'berlin', 'munich', 'hamburg'], country: 'Germany', rate: 19 },
    { keywords: ['spain', 'madrid', 'barcelona', 'valencia'], country: 'Spain', rate: 21 },
    { keywords: ['italy', 'rome', 'milan', 'naples'], country: 'Italy', rate: 22 },
    { keywords: ['netherlands', 'amsterdam', 'rotterdam'], country: 'Netherlands', rate: 21 },
    { keywords: ['belgium', 'brussels', 'antwerp'], country: 'Belgium', rate: 21 },
    { keywords: ['portugal', 'lisbon', 'porto'], country: 'Portugal', rate: 23 },
    { keywords: ['sweden', 'stockholm', 'gothenburg'], country: 'Sweden', rate: 25 },
    { keywords: ['denmark', 'copenhagen'], country: 'Denmark', rate: 25 },
    { keywords: ['norway', 'oslo', 'bergen'], country: 'Norway', rate: 25 },
    { keywords: ['finland', 'helsinki'], country: 'Finland', rate: 24 },
  ];
  
  for (const { keywords, country, rate } of euCountries) {
    if (keywords.some(keyword => addressLower.includes(keyword))) {
      return {
        taxType: 'VAT',
        taxLabel: `VAT (${country})`,
        defaultRate: rate,
        country,
      };
    }
  }
  
  // United States (by state)
  const usStates = [
    { keywords: ['california', 'ca'], state: 'California', rate: 7.25 },
    { keywords: ['texas', 'tx'], state: 'Texas', rate: 6.25 },
    { keywords: ['florida', 'fl'], state: 'Florida', rate: 6 },
    { keywords: ['new york', 'ny'], state: 'New York', rate: 4 },
    { keywords: ['illinois', 'il'], state: 'Illinois', rate: 6.25 },
    { keywords: ['washington', 'wa'], state: 'Washington', rate: 6.5 },
    { keywords: ['massachusetts', 'ma'], state: 'Massachusetts', rate: 6.25 },
  ];
  
  for (const { keywords, state, rate } of usStates) {
    if (keywords.some(keyword => addressLower.includes(keyword))) {
      return {
        taxType: 'Sales Tax',
        taxLabel: `Sales Tax (${state}, USA)`,
        defaultRate: rate,
        country: 'United States',
        region: state,
      };
    }
  }
  
  // Generic USA
  if (
    addressLower.includes('usa') || 
    addressLower.includes('united states') ||
    addressLower.includes('us')
  ) {
    return {
      taxType: 'Sales Tax',
      taxLabel: 'Sales Tax (USA)',
      defaultRate: 0, // Varies by state
      country: 'United States',
    };
  }
  
  // Canada
  if (
    addressLower.includes('canada') || 
    addressLower.includes('toronto') ||
    addressLower.includes('vancouver') ||
    addressLower.includes('montreal')
  ) {
    return {
      taxType: 'GST/HST',
      taxLabel: 'GST/HST (Canada)',
      defaultRate: 5, // Federal GST, provinces vary
      country: 'Canada',
    };
  }
  
  // Default fallback
  return {
    taxType: 'Sales Tax',
    taxLabel: 'Sales Tax',
    defaultRate: 0,
    country: 'Unknown',
  };
}

export function calculateTaxBreakdown(
  price: number,
  taxRate: number,
  isTaxInclusive: boolean
): {
  basePrice: number;
  taxAmount: number;
  totalPrice: number;
} {
  if (isTaxInclusive) {
    // Price includes tax - need to extract it
    // Formula: base = total / (1 + rate/100)
    const basePrice = price / (1 + taxRate / 100);
    const taxAmount = price - basePrice;
    return {
      basePrice: Math.round(basePrice * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalPrice: price,
    };
  } else {
    // Tax is added on top
    const taxAmount = price * (taxRate / 100);
    const totalPrice = price + taxAmount;
    return {
      basePrice: price,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  }
}

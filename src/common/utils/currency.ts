
// Maps ISO 3166-1 alpha-2 country codes to their currency symbol.
// These match the 13 countries supported at onboarding.
const COUNTRY_CURRENCY_SYMBOLS: Record<string, string> = {
  IN: '₹',    // India – INR
  AU: 'A$',   // Australia – AUD
  NZ: 'NZ$',  // New Zealand – NZD
  US: '$',    // United States – USD
  GB: '£',    // United Kingdom – GBP
  CA: 'C$',   // Canada – CAD
  CN: '¥',    // China – CNY
  JP: '¥',    // Japan – JPY
  KR: '₩',    // South Korea – KRW
  SG: 'S$',   // Singapore – SGD
  AE: 'AED',  // UAE – AED
  DE: '€',    // Germany – EUR
  FR: '€',    // France – EUR
};

// Fallback map for full country names – used for existing users whose
// country field was stored as a display name rather than an ISO code.
const COUNTRY_NAME_TO_SYMBOL: Record<string, string> = {
  'india': '₹',
  'australia': 'A$',
  'new zealand': 'NZ$',
  'united states': '$',
  'united kingdom': '£',
  'canada': 'C$',
  'china': '¥',
  'japan': '¥',
  'south korea': '₩',
  'singapore': 'S$',
  'united arab emirates': 'AED',
  'germany': '€',
  'france': '€',
};

export function getCurrencySymbol(country?: string): string {
  if (!country) return '$';
  // Try ISO code first (e.g. 'IN', 'US')
  const byCode = COUNTRY_CURRENCY_SYMBOLS[country.toUpperCase()];
  if (byCode) return byCode;
  // Fallback: try full country name (e.g. 'India', 'United States')
  return COUNTRY_NAME_TO_SYMBOL[country.toLowerCase()] ?? '$';
}


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

export function getCurrencySymbol(country?: string): string {
  if (!country) return '$';
  return COUNTRY_CURRENCY_SYMBOLS[country.toUpperCase()] ?? '$';
}

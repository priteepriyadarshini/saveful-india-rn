
export function getCurrencySymbol(country?: string): string {
  if (!country) return '$';
  const name = country.toLowerCase();
  if (name.includes('india')) return '₹';
  if (name.includes('united kingdom') || name.includes('uk') || name.includes('britain') || name.includes('england')) return '£';
  if (name.includes('euro') || name.includes('germany') || name.includes('france') || name.includes('spain') || name.includes('italy') || name.includes('netherlands')) return '€';
  if (name.includes('australia') || name.includes('new zealand') || name.includes('united states') || name.includes('usa') || name.includes('canada') || name.includes('singapore')) return '$';
  return '$';
}

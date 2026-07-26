export function getCountryIsoCode(countryName?: string | null): string {
  if (!countryName) return 'PT';
  const name = countryName.toLowerCase().trim();
  const map: Record<string, string> = {
    'portugal': 'PT',
    'brasil': 'BR',
    'brazil': 'BR',
    'espanha': 'ES',
    'spain': 'ES',
    'frança': 'FR',
    'france': 'FR',
    'reino unido': 'GB',
    'united kingdom': 'GB',
    'estados unidos': 'US',
    'united states': 'US'
  };
  return map[name] || 'PT';
}

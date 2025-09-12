// If you need international, use `libphonenumber-js`. For now assume US.
export function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  // Handle leading 1 for US/Canada
  const withCountry = digits.length === 11 && digits.startsWith('1')
    ? digits
    : digits.length === 10
    ? `1${digits}`
    : digits; // fallback: leave as-is
  return `+${withCountry}`;
}

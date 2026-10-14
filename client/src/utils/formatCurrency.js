/**
 * Format currency consistently in Indian Rupees (INR)
 * @param {number|string} price - Base price value
 * @returns {string} Formatted INR currency string (e.g. ₹7,490)
 */
export function formatINR(price) {
  if (price === null || price === undefined || isNaN(price)) return '₹0';
  const numeric = Number(price);
  // Realistic luxury fashion INR equivalent: standard 1:80 benchmark
  const inrValue = Math.round(numeric * 80);
  return '₹' + inrValue.toLocaleString('en-IN');
}

/**
 * Format raw value as INR without multiplication if already in INR
 */
export function formatRawINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return '₹' + Math.round(Number(amount)).toLocaleString('en-IN');
}

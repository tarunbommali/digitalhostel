/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a phone number with an optional country code.
 */
export function formatPhoneNumber(phone?: string, countryCode: string = "+91"): string {
  if (!phone) return "N/A";
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `${countryCode} ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
  }
  return phone;
}

/**
 * Truncates text to a maximum specified length with an ellipsis.
 */
export function truncateText(text: string, maxLength: number = 30): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Utility function to format dates to YYYY-MM-DD string format
 * Uses UTC to avoid timezone offset issues with DATE fields from MySQL
 * 
 * @param date Date object or string to format
 * @returns Formatted date string in YYYY-MM-DD format, or null if input is null/undefined
 */
export function formatDate(date: Date | string | null | undefined): string | null {
  // Handle null or undefined input
  if (!date) return null;

  // Convert string to Date if needed
  const d = typeof date === 'string' ? new Date(date) : date;

  // Use UTC methods to avoid timezone offset issues
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
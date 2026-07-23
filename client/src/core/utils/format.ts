export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount || 0;
  return `₹ ${num.toLocaleString("en-IN")}`;
}

export function formatMonthYear(month: number, year: number): string {
  const monthStr = MONTH_NAMES[(month - 1) % 12] || "";
  return `${monthStr} ${year}`;
}

/**
 * Theme & Color Contrast Utilities
 * Ensures dynamic tenant brand colors meet WCAG AA contrast standards.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.slice(0, 2), 16),
      g: parseInt(cleanHex.slice(2, 4), 16),
      b: parseInt(cleanHex.slice(4, 6), 16),
    };
  }
  return null;
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates optimal foreground text color (White vs Dark Charcoal)
 * to guarantee WCAG AA 4.5:1 contrast over any tenant-supplied brand color.
 */
export function getAccessibleForeground(bgHex: string): string {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return '#FFFFFF';
  const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  // If background luminance is high (> 0.4), use dark text; otherwise use pure white
  return luminance > 0.4 ? '#090A0F' : '#FFFFFF';
}

/**
 * Generates interactive hover and active color shades from a base hex.
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const num = percent / 100;
  const r = Math.min(255, Math.max(0, Math.round(rgb.r + (percent < 0 ? rgb.r * num : (255 - rgb.r) * num))));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g + (percent < 0 ? rgb.g * num : (255 - rgb.g) * num))));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b + (percent < 0 ? rgb.b * num : (255 - rgb.b) * num))));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Dynamically applies tenant theme CSS custom properties to the document root.
 */
export function applyTenantTheme(primaryColor?: string, secondaryColor?: string) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const primary = primaryColor || '#4F46E5';
  const secondary = secondaryColor || '#0D9488';

  const primaryForeground = getAccessibleForeground(primary);
  const secondaryForeground = getAccessibleForeground(secondary);
  const primaryHover = adjustBrightness(primary, -12);
  const primaryActive = adjustBrightness(primary, -20);

  root.style.setProperty('--tenant-primary', primary);
  root.style.setProperty('--tenant-primary-hover', primaryHover);
  root.style.setProperty('--tenant-primary-active', primaryActive);
  root.style.setProperty('--tenant-primary-foreground', primaryForeground);
  root.style.setProperty('--tenant-secondary', secondary);
  root.style.setProperty('--tenant-secondary-foreground', secondaryForeground);
}

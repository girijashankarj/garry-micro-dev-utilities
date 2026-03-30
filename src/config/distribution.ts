/**
 * How the product is delivered on mobile vs desktop extension.
 * Mobile install uses the same deployed PWA (Add to Home Screen), not the Chrome extension.
 */
export const MOBILE_DISTRIBUTION = 'pwa' as const;

export const MOBILE_INSTALL_NOTE =
  'Use the hosted web app in Chrome or Safari, then Add to Home Screen (Android) or Share → Add to Home Screen (iOS). Same URL as the site; no app store required.';

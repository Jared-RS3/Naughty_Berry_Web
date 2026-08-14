/**
 * The way back into the cookie preferences panel, from anywhere.
 *
 * Consent must be as easy to withdraw as it was to give, which means every page
 * needs a route back to the panel — including the lazy-loaded footers on routes
 * CookieBanner does not own. An event rather than React context for exactly
 * that reason: the trigger and the panel are never in the same subtree.
 *
 * Separate module rather than living in CookieBanner.tsx so that file exports
 * only components and keeps fast refresh working.
 */

import { isAnalyticsConfigured } from './analytics'

export const COOKIE_SETTINGS_EVENT = 'nb:open-cookie-settings'

/** Opens the preferences panel wherever CookieBanner happens to be mounted. */
export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT))
}

/**
 * False when no GA4 measurement ID is configured — nothing is tracked, so a
 * "Cookie settings" link would open a panel with nothing in it.
 */
export function cookieSettingsAvailable(): boolean {
  return isAnalyticsConfigured()
}

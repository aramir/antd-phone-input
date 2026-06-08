import { CountryCode } from 'libphonenumber-js';
/**
 * Returns a display name for a country code, falling back to the code itself.
 *
 * @param code country code
 */
export declare function countryLabel(code: CountryCode): string;
/**
 * Resolves the country from an E.164 string, returning `undefined` on failure.
 *
 * @param e164 phone number in +11234567890 format
 */
export declare function countryFromE164(e164: string): CountryCode | undefined;
/**
 * Formats an E.164 string in National format for display, falling back to the raw value.
 *
 * @param e164 phone number in +11234567890 format
 * @param country ISO country code; inferred from `e164` when omitted, defaulting to `"US"` if inference fails.
 */
export declare function toNationalDisplay(e164: string, country?: CountryCode): string;
/**
 * Strips all non-digit characters from a phone string.
 *
 * @param value phone number
 */
export declare function digitsOnly(value: string): string;
/**
 * Derives the country from an E.164 seed, falling back to `defaultCountry`.
 *
 * @param seed E.164 phone number
 * @param defaultCountry ISO country code to assume if unable to detect country from seed phone
 */
export declare function resolveCountry(seed: string | undefined, defaultCountry: CountryCode): CountryCode;
/**
 * Returns the max character length of a fully-formatted national number for a
 * given country, derived from the `libphonenumber-js` example number.
 *
 * @param country ISO country code
 */
export declare function maxNationalLength(country: CountryCode): number | undefined;

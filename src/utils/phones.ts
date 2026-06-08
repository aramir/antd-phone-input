import { getExampleNumber, parsePhoneNumberWithError } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/**
 * Returns a display name for a country code, falling back to the code itself.
 *
 * @param code country code
 */
export function countryLabel(code: CountryCode): string {
	try {
		return regionNames.of(code) ?? code;
	} catch {
		return code;
	}
}

/**
 * Resolves the country from an E.164 string, returning `undefined` on failure.
 *
 * @param e164 phone number in +11234567890 format
 */
export function countryFromE164(e164: string): CountryCode | undefined {
	try {
		return parsePhoneNumberWithError(e164).country as CountryCode | undefined;
	} catch {
		return undefined;
	}
}

/**
 * Formats an E.164 string in National format for display, falling back to the raw value.
 *
 * @param e164 phone number in +11234567890 format
 * @param country ISO country code; inferred from `e164` when omitted, defaulting to `"US"` if inference fails.
 */
export function toNationalDisplay(e164: string, country?: CountryCode): string {
	const resolved = country ?? resolveCountry(e164, "US");
	try {
		return parsePhoneNumberWithError(e164, resolved).formatNational();
	} catch {
		return e164;
	}
}

/**
 * Strips all non-digit characters from a phone string.
 *
 * @param value phone number
 */
export function digitsOnly(value: string): string {
	return value.replace(/\D/g, "");
}

/**
 * Derives the country from an E.164 seed, falling back to `defaultCountry`.
 *
 * @param seed E.164 phone number
 * @param defaultCountry ISO country code to assume if unable to detect country from seed phone
 */
export function resolveCountry(seed: string | undefined, defaultCountry: CountryCode): CountryCode {
	if (seed) {
		const parsed = countryFromE164(seed);
		if (parsed) return parsed;
	}
	return defaultCountry;
}

/**
 * Returns the max character length of a fully-formatted national number for a
 * given country, derived from the `libphonenumber-js` example number.
 *
 * @param country ISO country code
 */
export function maxNationalLength(country: CountryCode): number | undefined {
	try {
		const example = getExampleNumber(
			country,
			examples as Parameters<typeof getExampleNumber>[1],
		);
		return example?.formatNational().length;
	} catch {
		return undefined;
	}
}

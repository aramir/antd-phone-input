import { CountryCode } from 'libphonenumber-js';
import { default as React } from 'react';
export type FlagIconProps = {
    /** ISO Country code */
    country: CountryCode;
    /** Rendered width in px; height is derived at 3:2 ratio. */
    width?: number;
};
/**
 * Renders a country flag SVG scaled to `width` px (height derived at 3:2 ratio).
 * Falls back to the dial code when no flag asset is available.
 */
export default function FlagIcon({ country, width }: FlagIconProps): React.JSX.Element | null;

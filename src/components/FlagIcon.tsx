import type { CountryCode } from "libphonenumber-js";
import { getCountryCallingCode } from "libphonenumber-js";
import { hasFlag } from "country-flag-icons";
import { Typography } from "antd";
import * as Flags from "country-flag-icons/react/3x2";
import React from "react";

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
export default function FlagIcon({ country, width = 20 }: FlagIconProps) {
	if (!hasFlag(country)) {
		return (
			<Typography.Text style={{ fontSize: 12 }}>
				+{getCountryCallingCode(country)}
			</Typography.Text>
		);
	}
	const FlagComponent = (
		Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>
	)[country];
	if (!FlagComponent) return null;
	const height = Math.round((width * 2) / 3);
	return (
		<FlagComponent
			width={width}
			height={height}
			style={{ display: "block", flexShrink: 0, minWidth: width, minHeight: height }}
		/>
	);
}

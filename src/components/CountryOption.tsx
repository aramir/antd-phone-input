import type { CountryCode } from "libphonenumber-js";
import { getCountryCallingCode } from "libphonenumber-js";
import { Space, Typography } from "antd";
import FlagIcon from "./FlagIcon";

export type CountryOptionProps = {
	country: CountryCode;
	label: string;
	highlighted?: boolean;
};

/**
 * A single row inside the country-picker dropdown list.
 */
export default function CountryOption({ country, label, highlighted = false }: CountryOptionProps) {
	return (
		<div className={"ant-select-item ant-select-item-option" + (highlighted ? " ant-select-item-option-active" : "")}
		     style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
		>
			<Space size={8} style={{ pointerEvents: "none" }}>
				<FlagIcon country={country} />
				<span>{label}</span>
				<Typography.Text type="secondary">
					+{getCountryCallingCode(country)}
				</Typography.Text>
			</Space>
		</div>
	);
}

import { Typography } from "antd";
import { PhoneInput } from "../../src";
import CodeSample from "./CodeSample.tsx";

export default function Filtering() {
	// noinspection JSXUnresolvedComponent
	return (
		<>
			<p>
				<Typography.Text type={"secondary"}>
					Limited subset of countries
				</Typography.Text>
			</p>

			<div className={"demo-form-container"}>
				<PhoneInput allowedCountries={["US", "CA", "GB", "KY", "JP"]} />
			</div>

			<CodeSample code={"<PhoneInput allowedCountries={[\"US\", \"CA\", \"GB\", \"KY\", \"JP\"]} />"}/>
		</>
	)
}
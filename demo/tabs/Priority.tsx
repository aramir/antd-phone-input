import { Typography } from "antd";
import { PhoneInput } from "../../src";
import CodeSample from "./CodeSample.tsx";

export default function Priority() {
	// noinspection JSXUnresolvedComponent
	return (
		<>
			<p>
				<Typography.Text type={"secondary"}>
					US and Canada moved to the rop of the list
				</Typography.Text>
			</p>

			<div className={"demo-form-container"}>
				<PhoneInput priorityCountries={["US", "CA"]} />
			</div>

			<CodeSample code={"<PhoneInput priorityCountries={[\"US\", \"CA\"]} />"}/>
		</>
	)
}
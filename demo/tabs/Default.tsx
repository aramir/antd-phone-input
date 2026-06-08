import { Typography } from "antd";
import { PhoneInput } from "../../src";
import CodeSample from "./CodeSample.tsx";

export default function Default() {
	// noinspection JSXUnresolvedComponent
	return (
		<>
			<p>
				<Typography.Text type={"secondary"}>
					Country calling code is shown and country search is available. Searches by country name, ISO code or a calling code prefix
				</Typography.Text>
			</p>

			<div className={"demo-form-container"}>
				<PhoneInput defaultValue={"+15551234567"} />
			</div>

			<CodeSample code={"<PhoneInput defaultValue={\"+15551234567\"} />"}/>
		</>
	)
}
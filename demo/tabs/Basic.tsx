import { PhoneInput } from "../../src";
import { Typography } from "antd";
import CodeSample from "./CodeSample.tsx";

export default function Basic() {
	// noinspection JSXUnresolvedComponent
	return (
		<>
			<p>
				<Typography.Text type={"secondary"}>
					Most basic form with country calling code display and country search turned off
				</Typography.Text>
			</p>

			<div className={"demo-form-container"}>
				<PhoneInput callingCode={false} searchable={false} defaultValue={"+15551234567"} />
			</div>

			<CodeSample code={"<PhoneInput callingCode={false} searchable={false} />"}/>
		</>
	)
}
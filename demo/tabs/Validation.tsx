import { Form, Typography } from "antd";
import { buildPhoneRule, PhoneInput } from "../../src";
import CodeSample from "./CodeSample.tsx";

export default function Validation() {
	const [form] = Form.useForm();

	// noinspection JSXUnresolvedComponent
	return (
		<>
			<p>
				<Typography.Text type={"secondary"}>
					AntD Form/Form.Item with validation rule helper
				</Typography.Text>
			</p>

			<div className={"demo-form-container"}>
				<Form form={form} layout={"vertical"} requiredMark={false}>
					<Form.Item name="phone" label="Phone"
					           rules={[
						           { required: true, message: "Phone is required" },
						           buildPhoneRule("Enter a valid phone number"),
					           ]}
					>
						<PhoneInput />
					</Form.Item>
				</Form>
			</div>

			<CodeSample code={"<Form form={form}>\n" +
				"  <Form.Item name=\"phone\" label=\"Phone\"\n" +
				"             rules={[\n" +
				"               { required: true, message: \"Phone is required\" },\n" +
				"               buildPhoneRule(\"Enter a valid phone number\"),\n" +
				"             ]}\n" +
				"    <PhoneInput />\n" +
				"  </Form.Item>\n" +
				"</Form>"} />
		</>
	)
}
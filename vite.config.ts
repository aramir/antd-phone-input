import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	base: "/antd-phone-input/",
	build: {
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: "react",
							test: /node_modules\/(react|react-dom|react-router)\//,
						},
						{
							name: "antd",
							test: /node_modules\/(antd|@ant-design)\//,
						},
						{
							name: "phones",
							test: /node_modules\/(libphonenumber-js)\//,
						},
						{
							name: "flags",
							test: /node_modules\/(country-flag-icons)\//,
						},
					]
				}
			}
		}
	}
});
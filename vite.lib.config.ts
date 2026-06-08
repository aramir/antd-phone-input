import { defineConfig } from "vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
	plugins: [
		react(),
		dts({
			tsconfigPath: "./tsconfig.lib.json",
			exclude: ["src/**/__tests__/**", "**/*.test.{ts,tsx}", "**/tests-setup.ts"],
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			formats: ["es"],
		},
		copyPublicDir: false,
		rollupOptions: {
			output: {
				entryFileNames: "[name].js",
			},
			external: [
				"react",
				"react-dom",
				"@rc-component/virtual-list",
				"antd",
				"libphonenumber-js",
				"libphonenumber-js/examples.mobile.json",
				"country-flag-icons",
				"country-flag-icons/react/3x2",
			],
		},
	},
})

import { describe, it, expect } from "vitest";
import { buildPhoneRule } from "../rules";

describe("buildPhoneRule", () => {
	type Validator = (rule: object, value: string | undefined) => Promise<void>;
	const getValidator = (msg?: string) =>
		(buildPhoneRule(msg) as { validator: Validator }).validator;

	it("resolves for undefined (empty field)", async () => {
		await expect(getValidator()({}, undefined)).resolves.toBeUndefined();
	});

	it("resolves for empty string", async () => {
		await expect(getValidator()({}, "")).resolves.toBeUndefined();
	});

	it("resolves for a valid E.164 number", async () => {
		await expect(getValidator()({}, "+12133734253")).resolves.toBeUndefined();
	});

	it("rejects for an invalid number with the default message", async () => {
		await expect(getValidator()({}, "+1234")).rejects.toThrow(
			"Please enter a valid phone number",
		);
	});

	it("rejects with a custom message when provided", async () => {
		await expect(getValidator("Bad number")({}, "+1234")).rejects.toThrow("Bad number");
	});

	it("rejects for a non-E.164 garbage string", async () => {
		await expect(getValidator()({}, "not-a-phone")).rejects.toThrow();
	});
});
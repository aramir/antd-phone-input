import type { Rule, RuleObject } from "antd/lib/form";
import { isValidPhoneNumber } from "libphonenumber-js";

/**
 * Returns an Ant Design `Rule` that validates a phone field using `libphonenumber-js`.
 * Empty / undefined values pass — pair with a `required` rule if the field is mandatory.
 *
 * @param message Custom rejection message.
 */
export function buildPhoneRule(message = "Please enter a valid phone number"): Rule {
	return {
		validator(_: RuleObject, value: string | undefined) {
			if (!value) return Promise.resolve();
			try {
				if (isValidPhoneNumber(value)) return Promise.resolve();
			} catch {
				// fall through
			}
			return Promise.reject(new Error(message));
		},
	};
}
